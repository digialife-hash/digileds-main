import express from 'express';
import upload from '../middlewares/multer.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { uploadDocument, getAllDocuments, deleteDocument} from '../controllers/ClientDocumnetUpload.js';

const router = express.Router();

//post document
router.post("/upload",protect,authorizeRoles("client","super_admin","admin"),upload.fields([{name: "file", maxCount: 1,},{name: "backFile",maxCount: 1,},]),uploadDocument);
// Get all documents
router.get("/", protect, authorizeRoles("client", "super_admin", "admin"), getAllDocuments);

// Delete a document by ID
router.delete("/:id", protect, authorizeRoles("client", "super_admin", "admin"), deleteDocument);

export default router;
