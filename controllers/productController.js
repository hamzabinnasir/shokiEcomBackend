import productModel from "../models/productModel.js";
import reviewModel from "../models/reviewsModel.js";
import userModel from "../models/userModel.js"
const createProduct = async (req, res) => {
    try {
        const { imageUrl, brand, title, color, quantity, price, discountPrice, discountPercentage, topLevelCategory, secondLevelCategory, description, thirdLevelCategory, size } = req.body;
        if (!imageUrl || !brand || !title || !color || !quantity || !price || !discountPrice || !discountPercentage || !topLevelCategory || !secondLevelCategory || !thirdLevelCategory || !description) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        let newProduct = await productModel.create({
            orderId: `PROD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            imageUrl,
            brand,
            title,
            color: color ? color.toLowerCase() : "",
            quantity,
            price,
            description,
            discountPrice,
            discountPercentage,
            topLevelCategory,
            secondLevelCategory,
            thirdLevelCategory,
            size,
        });

        return res.json({ success: true, message: "Product Added Successfully" });
    } catch (error) {
        console.log("Product creation error:", error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: `Validation Error: ${validationErrors.join(', ')}` });
        }
        return res.status(500).json({ success: false, message: `Internal Server Error: ${error.message}` });
    }
}


const getAllProducts = async (req, res) => {
    try {
        let findAllProducts = await productModel.find();
        if (!findAllProducts) {
            return res.status(404).json({ success: false, message: "Products not found" });
        }
        res.json({ success: true, findAllProducts });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Internal Server Error" });
    }
}

const getSingleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ success: false, message: "Product not found" });
        }
        let singleProduct = await productModel.findById(productId).populate({
            path: "ratingsAndReviews",
            populate: [
                { path: "ratedProductId" },
                { path: "raterId" }
            ]
        });
        if (!singleProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let findedFilteredProducts = await productModel.find();

        return res.json({ success: true, singleProduct, findedFilteredProducts });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.json({ success: false, message: "Product not found" });
        }
        await productModel.findByIdAndDelete(productId);

        let findedFilteredProducts = await productModel.find();
        if (!findedFilteredProducts) {
            return res.status(400).json({ success: false, message: "Products not found" });
        }
        return res.json({ success: true, message: "Product deleted Successfully", findedFilteredProducts });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const updateProduct = async (req, res) => {
    try {
        const { productId, imageUrl, brand, title, color, quantity, price, discountPrice, discountPercentage, topLevelCategory, secondLevelCategory, thirdLevelCategory, description, size } = req.body;
        if (!productId) {
            return res.status(400).json({ success: false, message: "Product not found" });
        }

        if (!imageUrl || !brand || !title || !color || !quantity || !price || !discountPrice || !discountPercentage || !topLevelCategory || !secondLevelCategory || !thirdLevelCategory || !description || !size) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        let productUpdated = await productModel.findByIdAndUpdate(
            productId,
            {
                imageUrl,
                brand,
                title,
                color,
                quantity,
                price,
                discountPrice,
                discountPercentage,
                topLevelCategory,
                secondLevelCategory,
                thirdLevelCategory,
                description,
                size,
            })

        if (!productUpdated) {
            return res.status(400).json({ success: false, message: "Product not found" });
        }

        return res.status(200).json({ success: true, message: "Product Updated Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const filterProduct = async (req, res) => {
    try {
        const { topLevelCategory, secondLevelCategory, thirdLevelCategory, color, priceRange, discountRange, availability, size } = req.body;

        let filterProductData = {};
        if (topLevelCategory && topLevelCategory !== "") filterProductData.topLevelCategory = topLevelCategory;
        if (secondLevelCategory && secondLevelCategory !== "") filterProductData.secondLevelCategory = secondLevelCategory;
        if (thirdLevelCategory && thirdLevelCategory !== "") filterProductData.thirdLevelCategory = thirdLevelCategory;


        // When I have to check the whole array field from backend with single field in the backend
        if (color && Array.isArray(color) && color.length > 0) {
            filterProductData.color = { $in: color };
        }

        // When one field have to compare with multiple fields in the backend model
        //     if (size) {
        //     filterProductData["$or"] = [
        //         { sizeName1: size },
        //         { sizeName2: size },
        //         { sizeName3: size },
        //     ]
        // }

        if (priceRange && priceRange !== "") {
            let [minPrice, maxPrice] = priceRange.split("to").map((p) => Number(p.trim()));
            if (isNaN(minPrice) || isNaN(maxPrice)) {
                return res.status(400).json({ success: false, message: "Price must be in numbers" });
            }
            filterProductData.price = { $gte: minPrice, $lte: maxPrice };
        }
        if (discountRange && discountRange !== "") {
            let discountRangeNum = parseInt(discountRange);
            if (isNaN(discountRange)) {
                return res.status(400).json({ success: false, message: "Discount range must be in numbers" })
            }
            filterProductData.discountPercentage = { $gte: discountRangeNum }
        }

        if (availability && availability !== "" && availability == "inStock") filterProductData.quantity = { $gt: 0 };
        if (availability && availability !== "" && availability == "outOfStock") filterProductData.quantity = 0;

        if (size && Array.isArray(size) && size.length > 0) {
            filterProductData["size.sizeName"] = { $in: size };
        }

        let findedFilteredProducts = await productModel.find(filterProductData);
        return res.status(200).json({ success: true, findedFilteredProducts });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// _____________________ ** Product Ratings APIS **__________________________
const rateProduct = async (req, res) => {
    try {
      const { title, description, ratings, userId, productId } = req.body;
  
      if (!userId) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      if (!productId) {
        return res.status(400).json({ success: false, message: "Product not found" });
      }
  
      if (!ratings || ratings < 1) {
        return res.status(400).json({ success: false, message: "Please give at least 1 star rating" });
      }
  
      const productReview = await reviewModel.create({
        title,
        description,
        ratings: parseInt(ratings),
        raterId: userId,
        ratedProductId: productId,
      });
  
      await productModel.findByIdAndUpdate(productId, {
        $push: { ratingsAndReviews: productReview._id },
      });
  
      await userModel.findByIdAndUpdate(userId, {
        $push: { productRatingsDetails: productReview._id },
      });
  
      return res.status(200).json({ success: true, message: "Product Rated Successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
  
const getUserRatedProducts = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let userProductRatingDetails = await userModel.findById(userId).populate({
            path: "productRatingsDetails",
        });

        return res.status(200).json({ success: true, data: userProductRatingDetails });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


const allUserRatings = async (req, res) => {
    try {
        let allUsersRatingsDetails = await userModel.find().populate({
            path: "productRatingsDetails",
        })

        if (!allUsersRatingsDetails) {
            return res.json({ success: false, message: "Rating Details not found" });
        }

        return res.status(200).json({ success: true, allUsersRatingsDetails });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getProductRatingsDetails = async (req, res) =>{
    try{
        const {productId} = req.body;
    if(!productId){
        return res.status(400).json({success: false, message: "product Id not found"})
    }

    let findedProductRatings = await productModel.findById(productId).populate({
        path: "ratingsAndReviews",
        populate: {
            path: "raterId",
            select: "username",
        }
    });

    if(!findedProductRatings){
        return res.status(404).json({success: false, message: "product not found"})
    }

    let findedProductRatingsDetails = findedProductRatings?.ratingsAndReviews
    return res.status(200).json({success: true, findedProductRatingsDetails})
    }catch(error){
        console.log(error);
        return res.status(500).json({success: false, message: "Internal Server Error"})
    }
}



const productOrderStatus = async (req, res) => {
    try{
        const {productId} = req.body;
    if(!productId){
        return res.status(400).json({success: false, message: "Product Id dont found"});
    }
    let findedProduct = await productModel.findById(productId).populate("orderId");
    if(!findedProduct){
        return res.status(404).json({success: false, message: "Product not found"})
    }
    return res.status(200).json({success: true, findedProduct});
    }catch(error){
        console.log(error);
        return res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

const searchProducts = async (req, res) => {
    try {
        const { searchTerm } = req.body;
        
        if (!searchTerm || searchTerm.trim() === "") {
            return res.status(400).json({ success: false, message: "Search term is required" });
        }

        // Normalize and tokenize the search term
        const cleanedSearchTerm = searchTerm.trim().toLowerCase().replace(/\s+/g, ' ');
        const tokens = cleanedSearchTerm.split(' ').filter(Boolean);
        const noSpaceTerm = cleanedSearchTerm.replace(/\s+/g, '');

        // Escape special regex chars
        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Full phrase regex (for contiguous matches)
        const phraseRegex = new RegExp(escapeRegex(cleanedSearchTerm), 'i');
        const noSpaceRegex = new RegExp(escapeRegex(noSpaceTerm), 'i');

        // Build AND-of-ORs: every token must appear in at least one of the fields
        const andOfOrs = tokens.map((token) => {
            const tokenRegex = new RegExp(escapeRegex(token), 'i');
            return {
                $or: [
                    { thirdLevelCategory: tokenRegex },
                    { secondLevelCategory: tokenRegex },
                    { topLevelCategory: tokenRegex },
                    { title: tokenRegex },
                    { brand: tokenRegex },
                    { description: tokenRegex },
                    { color: tokenRegex },
                ]
            };
        });

        const query = {
            $or: [
                // Exact field equals phrase
                { thirdLevelCategory: { $regex: new RegExp(`^${escapeRegex(cleanedSearchTerm)}$`, 'i') } },
                { secondLevelCategory: { $regex: new RegExp(`^${escapeRegex(cleanedSearchTerm)}$`, 'i') } },
                { topLevelCategory: { $regex: new RegExp(`^${escapeRegex(cleanedSearchTerm)}$`, 'i') } },
                // Phrase appears anywhere
                { thirdLevelCategory: phraseRegex },
                { secondLevelCategory: phraseRegex },
                { topLevelCategory: phraseRegex },
                { title: phraseRegex },
                { brand: phraseRegex },
                { description: phraseRegex },
                { color: phraseRegex },
                // No-space matching to support DB values stored without spaces (e.g., "lenghaChohli")
                { thirdLevelCategory: noSpaceRegex },
                { secondLevelCategory: noSpaceRegex },
                { topLevelCategory: noSpaceRegex },
                { title: noSpaceRegex },
                { brand: noSpaceRegex },
                { description: noSpaceRegex },
                { color: noSpaceRegex },
                // All tokens must be present across fields
                { $and: andOfOrs }
            ]
        };

        const findedProducts = await productModel.find(query);

        // Sort results by relevance (exact matches first, then phrase matches, then token matches)
        const sortedProducts = findedProducts.sort((a, b) => {
            const toLc = (v) => (v || "").toLowerCase();
            const aFields = [a.thirdLevelCategory, a.secondLevelCategory, a.topLevelCategory, a.title, a.brand, a.description, a.color].map(toLc);
            const bFields = [b.thirdLevelCategory, b.secondLevelCategory, b.topLevelCategory, b.title, b.brand, b.description, b.color].map(toLc);

            const exactEq = (fields, term) => fields.some((f) => f === term);
            const phraseIn = (fields, term) => fields.some((f) => f.includes(term));

            const aExact = exactEq(aFields, cleanedSearchTerm);
            const bExact = exactEq(bFields, cleanedSearchTerm);
            if (aExact !== bExact) return aExact ? -1 : 1;

            const aPhrase = phraseIn(aFields, cleanedSearchTerm) || phraseIn(aFields, noSpaceTerm);
            const bPhrase = phraseIn(bFields, cleanedSearchTerm) || phraseIn(bFields, noSpaceTerm);
            if (aPhrase !== bPhrase) return aPhrase ? -1 : 1;

            // Prefer matches where more tokens are present
            const tokenCount = (fields) => tokens.reduce((cnt, t) => cnt + (fields.some((f) => f.includes(t)) ? 1 : 0), 0);
            return tokenCount(bFields) - tokenCount(aFields);
        });

        return res.status(200).json({ 
            success: true, 
            findedFilteredProducts: sortedProducts,
            searchTerm: cleanedSearchTerm
        });
    } catch (error) {
        console.log("Search error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


export { createProduct, getAllProducts, getSingleProduct, deleteProduct, updateProduct, rateProduct, getUserRatedProducts, allUserRatings, filterProduct, productOrderStatus, getProductRatingsDetails, searchProducts };