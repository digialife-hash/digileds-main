import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Document from "../models/EmployeeDocumentUpload.js";
import Employee from "../models/Employee.js";
import fs from "fs";

export const uploadDocumentEmp = async (req, res) => {
  try {
    const { title, documentType, description = "", employeeId, employeeEmail, employeeName } = req.body;

    // Check primary file
    const fileToUpload = req.file || req.files?.file?.[0];
    if (!fileToUpload) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file.",
      });
    }

    let finalEmployeeId;
    let finalEmployeeEmail;
    let finalEmployeeName;

    // Ownership Enforcement
    if (req.user.role === "employee") {
      const employee = await Employee.findOne({ userId: req.user._id });
      if (!employee) {
        return res.status(403).json({
          success: false,
          message: "Employee profile not found.",
        });
      }
      finalEmployeeId = employee._id;
      finalEmployeeEmail = req.user.email;
      finalEmployeeName = req.user.name;
    } else if (
      req.user.role === "super_admin" ||
      req.user.role === "admin" ||
      req.user.role === "hr"
    ) {
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required.",
        });
      }
      if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid employee id.",
        });
      }

      const targetEmployee = await Employee.findById(employeeId);
      if (!targetEmployee) {
        // Maybe employeeId is a User ID
        const targetEmployeeByUser = await Employee.findOne({ userId: employeeId });
        if (!targetEmployeeByUser) {
          return res.status(404).json({
            success: false,
            message: "Target employee not found.",
          });
        }
        finalEmployeeId = targetEmployeeByUser._id;
        finalEmployeeEmail = targetEmployeeByUser.email;
        finalEmployeeName = targetEmployeeByUser.name;
      } else {
        finalEmployeeId = targetEmployee._id;
        finalEmployeeEmail = targetEmployee.email;
        finalEmployeeName = targetEmployee.name;
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Access Denied.",
      });
    }

    // Validate required fields
    if (!title || !documentType) {
      return res.status(400).json({
        success: false,
        message: "Title and document type are required.",
      });
    }

    // Upload to Cloudinary (Primary file)
    const result = await cloudinary.uploader.upload(fileToUpload.path, {
      folder: `employee_documents/${finalEmployeeId}`,
      resource_type: "auto",
    });

    // Upload to Cloudinary (Back side, only for address proof)
    let backResult = null;
    const backFile = req.files?.backFile?.[0];
    if (documentType === "address_proof" && backFile) {
      backResult = await cloudinary.uploader.upload(backFile.path, {
        folder: `employee_documents/${finalEmployeeId}`,
        resource_type: "auto",
      });
    }

    // Save document in MongoDB
    const document = await Document.create({
      NewEmployee_id: finalEmployeeId,
      email: finalEmployeeEmail,
      name: finalEmployeeName,
      title,
      documentType,
      description,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      fileName: fileToUpload.originalname,
      fileType: fileToUpload.mimetype,
      fileSize: fileToUpload.size,
      // Back side fields
      backFileUrl: backResult ? backResult.secure_url : "",
      backPublicId: backResult ? backResult.public_id : "",
      backResourceType: backResult ? backResult.resource_type : "",
      backFileName: backFile ? backFile.originalname : "",
      backFileType: backFile ? backFile.mimetype : "",
      backFileSize: backFile ? backFile.size : 0,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      data: document,
    });

  } catch (error) {
    console.error("[Upload Error] employee document upload failed:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });

  } finally {
    // Always delete local files
    const fileToUpload = req.file || req.files?.file?.[0];
    if (fileToUpload && fs.existsSync(fileToUpload.path)) {
      fs.unlink(fileToUpload.path, (err) => {
        if (err) console.error("Error deleting local file:", err.message);
      });
    }
    const backFile = req.files?.backFile?.[0];
    if (backFile && fs.existsSync(backFile.path)) {
      fs.unlink(backFile.path, (err) => {
        if (err) console.error("Error deleting local backFile:", err.message);
      });
    }
  }
};

export const getAllDocumentsEmp = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "employee") {
      const employee = await Employee.findOne({ userId: req.user._id });
      if (!employee) {
        filter = { NewEmployee_id: req.user._id };
      } else {
        filter = {
          $or: [
            { NewEmployee_id: employee._id },
            { NewEmployee_id: req.user._id }
          ]
        };
      }
    } else if (
      req.user.role === "super_admin" ||
      req.user.role === "admin" ||
      req.user.role === "hr"
    ) {
      if (req.query.employeeId && mongoose.Types.ObjectId.isValid(req.query.employeeId)) {
        const employee = await Employee.findById(req.query.employeeId);
        if (employee) {
          filter = {
            $or: [
              { NewEmployee_id: employee._id },
              { NewEmployee_id: employee.userId }
            ]
          };
        } else {
          const employeeByUser = await Employee.findOne({ userId: req.query.employeeId });
          if (employeeByUser) {
            filter = {
              $or: [
                { NewEmployee_id: employeeByUser._id },
                { NewEmployee_id: req.query.employeeId }
              ]
            };
          } else {
            filter = { NewEmployee_id: req.query.employeeId };
          }
        }
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view employee documents.",
      });
    }

    const documents = await Document.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteDocumentEmp = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document id.",
      });
    }

    // Find document
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    // Validate ownership
    if (req.user.role === "employee") {
      const employee = await Employee.findOne({ userId: req.user._id });
      const isOwner =
        (employee && String(document.NewEmployee_id) === String(employee._id)) ||
        String(document.NewEmployee_id) === String(req.user._id);

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to delete this document.",
        });
      }
    } else if (
      req.user.role !== "super_admin" &&
      req.user.role !== "admin" &&
      req.user.role !== "hr"
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete employee documents.",
      });
    }

    // Delete files from Cloudinary
    await cloudinary.uploader.destroy(document.publicId, {
      resource_type: document.resourceType,
    });

    if (document.backPublicId) {
      await cloudinary.uploader.destroy(document.backPublicId, {
        resource_type: document.backResourceType || "image",
      });
    }

    // Delete document from MongoDB
    await Document.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};