import multer from "multer";
try {
    const storage = multer.diskStorage({
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        }
    })
} catch (error) {
    console.log(error.message);
}

const upload = multer({ storage });
export default upload;