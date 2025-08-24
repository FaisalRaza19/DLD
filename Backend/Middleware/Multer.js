import multer from "multer";
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "temp"),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + "-" + file.originalname);
    },
});


export const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } })
