import express from 'express';
import upload from '../middlewares/multer.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import checkPermission from '../middlewares/checkPermission.js';
import { uploadDocumentEmp, getAllDocumentsEmp, deleteDocumentEmp} from '../controllers/EmpDocumentUpload.js';

const router = express.Router();

//post document
router.post(
    "/upload",
    protect,
    authorizeRoles("employee", "super_admin", "admin", "hr"),
    checkPermission("documents", "create"),
    upload.fields([
        { name: "file", maxCount: 1 },
        { name: "backFile", maxCount: 1 }
    ]),
    uploadDocumentEmp
);

// Get all documents
router.get("/", protect, authorizeRoles("employee", "super_admin", "admin", "hr"), checkPermission("documents", "view"), getAllDocumentsEmp);

// Delete a document by ID
router.delete("/:id", protect, authorizeRoles("employee", "super_admin", "admin", "hr"), checkPermission("documents", "delete"), deleteDocumentEmp);

export default router;