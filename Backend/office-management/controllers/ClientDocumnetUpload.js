import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Document from "../models/ClientDocumentUpload.js";
import Client from "../models/Client.js";
import fs from "fs";

/*
|--------------------------------------------------------------------------
| UPLOAD DOCUMENT
|--------------------------------------------------------------------------
*/

export const uploadDocument = async (req, res) => {
  let fileToUpload = null;
  let backFile = null;

  try {
    console.log("======================================");
    console.log("===== CLIENT DOCUMENT UPLOAD =====");
    console.log("======================================");

    const {
      title,
      documentType,
      description = "",
      clientId,
      clientEmail,
      clientName,
    } = req.body;

    console.log("Request body:", req.body);

    // -----------------------------------------
    // FILE
    // -----------------------------------------

    fileToUpload =
      req.file ||
      req.files?.file?.[0] ||
      null;

    backFile =
      req.files?.backFile?.[0] ||
      null;

    if (!fileToUpload) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file.",
        error: null,
      });
    }

    console.log("Primary file:", {
      fieldname: fileToUpload.fieldname,
      originalname: fileToUpload.originalname,
      mimetype: fileToUpload.mimetype,
      size: fileToUpload.size,
      path: fileToUpload.path,
    });

    if (backFile) {
      console.log("Back file:", {
        fieldname: backFile.fieldname,
        originalname: backFile.originalname,
        mimetype: backFile.mimetype,
        size: backFile.size,
        path: backFile.path,
      });
    }

    // -----------------------------------------
    // REQUIRED FIELDS
    // -----------------------------------------

    if (!title || !documentType) {
      return res.status(400).json({
        success: false,
        message:
          "Title and document type are required.",
        error: null,
      });
    }

    // -----------------------------------------
    // CLIENT OWNERSHIP
    // -----------------------------------------

    let finalClientId;
    let finalClientEmail;
    let finalClientName;

    // CLIENT
    if (req.user.role === "client") {
      console.log("User role: CLIENT");

      const clientProfile =
        await Client.findOne({
          email: req.user.email,
        });

      if (!clientProfile) {
        return res.status(403).json({
          success: false,
          message:
            "Client profile not found.",
          error: null,
        });
      }

      finalClientId =
        clientProfile._id;

      finalClientEmail =
        clientProfile.email;

      finalClientName =
        clientProfile.clientName ||
        req.user.name;
    }

    // ADMIN / SUPER ADMIN
    else if (
      req.user.role === "admin" ||
      req.user.role === "super_admin"
    ) {
      console.log("User role: ADMIN");

      if (!clientId) {
        return res.status(400).json({
          success: false,
          message:
            "Client ID is required.",
          error: null,
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          clientId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid client ID.",
          error: null,
        });
      }

      const targetClient =
        await Client.findById(
          clientId
        );

      if (!targetClient) {
        // Fallback: clientId could be User ID
        console.log(
          "Client not found by _id. Checking createdBy..."
        );

        const targetClientByUser =
          await Client.findOne({
            createdBy: clientId,
          });

        if (!targetClientByUser) {
          return res.status(404).json({
            success: false,
            message:
              "Target client not found.",
            error: null,
          });
        }

        finalClientId =
          targetClientByUser._id;

        finalClientEmail =
          targetClientByUser.email;

        finalClientName =
          targetClientByUser.clientName;
      } else {
        finalClientId =
          targetClient._id;

        finalClientEmail =
          targetClient.email;

        finalClientName =
          targetClient.clientName;
      }
    }

    // OTHER ROLE
    else {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
        error: null,
      });
    }

    console.log(
      "Final client information:",
      {
        clientId: finalClientId,
        email: finalClientEmail,
        name: finalClientName,
      }
    );

    // -----------------------------------------
    // CLOUDINARY CONFIG CHECK
    // -----------------------------------------

    console.log(
      "===== CLOUDINARY CONFIG ====="
    );

    console.log({
      cloud_name:
        process.env
          .CLOUDINARY_CLOUD_NAME,

      api_key:
        process.env
          .CLOUDINARY_API_KEY,

      api_secret:
        process.env
          .CLOUDINARY_API_SECRET
          ? "SET"
          : "NOT SET",
    });

    if (
      !process.env
        .CLOUDINARY_CLOUD_NAME ||
      !process.env
        .CLOUDINARY_API_KEY ||
      !process.env
        .CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Cloudinary configuration is incomplete.",
        error: null,
      });
    }

    // -----------------------------------------
    // CHECK LOCAL PRIMARY FILE
    // -----------------------------------------

    if (!fileToUpload.path) {
      return res.status(400).json({
        success: false,
        message:
          "Uploaded file path is missing.",
        error: null,
      });
    }

    if (
      !fs.existsSync(
        fileToUpload.path
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Uploaded file does not exist on server.",
        error: null,
      });
    }

    // -----------------------------------------
    // CLOUDINARY PRIMARY UPLOAD
    // -----------------------------------------

    console.log(
      "===== CLOUDINARY PRIMARY UPLOAD START ====="
    );

    let result;

    try {
      result =
        await cloudinary.uploader.upload(
          fileToUpload.path,
          {
            folder: `client_documents/${finalClientId.toString()}`,
            resource_type: "auto",
          }
        );

      console.log(
        "===== CLOUDINARY PRIMARY UPLOAD SUCCESS ====="
      );

      console.log({
        public_id:
          result.public_id,

        secure_url:
          result.secure_url,

        resource_type:
          result.resource_type,
      });
    } catch (
      cloudinaryError
    ) {
      console.error(
        "===== CLOUDINARY PRIMARY UPLOAD ERROR ====="
      );

      console.error({
        message:
          cloudinaryError.message,

        http_code:
          cloudinaryError.http_code,

        name:
          cloudinaryError.name,
      });

      throw cloudinaryError;
    }

    // -----------------------------------------
    // BACK FILE
    // -----------------------------------------

    let backResult = null;

    if (
      documentType ===
        "address_proof" &&
      backFile
    ) {
      console.log(
        "===== CLOUDINARY BACK FILE UPLOAD START ====="
      );

      if (
        backFile.path &&
        fs.existsSync(
          backFile.path
        )
      ) {
        try {
          backResult =
            await cloudinary.uploader.upload(
              backFile.path,
              {
                folder: `client_documents/${finalClientId}`,
                resource_type: "auto",
              }
            );

          console.log(
            "===== CLOUDINARY BACK FILE UPLOAD SUCCESS ====="
          );

          console.log({
            public_id:
              backResult.public_id,

            secure_url:
              backResult.secure_url,

            resource_type:
              backResult.resource_type,
          });
        } catch (
          cloudinaryError
        ) {
          console.error(
            "===== CLOUDINARY BACK FILE UPLOAD ERROR ====="
          );

          console.error({
            message:
              cloudinaryError.message,

            http_code:
              cloudinaryError.http_code,

            name:
              cloudinaryError.name,
          });

          throw cloudinaryError;
        }
      }
    }

    // -----------------------------------------
    // SAVE DOCUMENT
    // -----------------------------------------

    console.log(
      "===== SAVING DOCUMENT TO MONGODB ====="
    );

    const document =
      await Document.create({
        NewClient_id:
          finalClientId,

        email:
          finalClientEmail,

        name:
          finalClientName,

        title,

        documentType,

        description,

        fileUrl:
          result.secure_url,

        publicId:
          result.public_id,

        resourceType:
          result.resource_type,

        fileName:
          fileToUpload.originalname,

        fileType:
          fileToUpload.mimetype,

        fileSize:
          fileToUpload.size,

        // Back side
        backFileUrl:
          backResult?.secure_url ||
          "",

        backPublicId:
          backResult?.public_id ||
          "",

        backResourceType:
          backResult?.resource_type ||
          "",

        backFileName:
          backFile?.originalname ||
          "",

        backFileType:
          backFile?.mimetype ||
          "",

        backFileSize:
          backFile?.size ||
          0,
      });

    console.log(
      "===== DOCUMENT SAVED SUCCESSFULLY ====="
    );

    // -----------------------------------------
    // RESPONSE
    // -----------------------------------------

    return res.status(201).json({
      success: true,
      message:
        "Document uploaded successfully.",
      data: document,
      error: null,
    });
  } catch (error) {
    console.error(
      "======================================"
    );

    console.error(
      "[Upload Error] client document upload failed:"
    );

    console.error({
      message: error.message,
      name: error.name,
      http_code:
        error.http_code,
      stack: error.stack,
    });

    console.error(
      "======================================"
    );

    return res.status(
      error.http_code || 500
    ).json({
      success: false,

      message:
        error.message ||
        "Document upload failed.",

      error: {
        code:
          error.http_code ||
          500,
      },
    });
  } finally {
    // -----------------------------------------
    // DELETE LOCAL PRIMARY FILE
    // -----------------------------------------

    try {
      if (
        fileToUpload?.path &&
        fs.existsSync(
          fileToUpload.path
        )
      ) {
        fs.unlinkSync(
          fileToUpload.path
        );

        console.log(
          "Local primary file deleted."
        );
      }
    } catch (
      deleteError
    ) {
      console.error(
        "Primary file delete error:",
        deleteError.message
      );
    }

    // -----------------------------------------
    // DELETE LOCAL BACK FILE
    // -----------------------------------------

    try {
      if (
        backFile?.path &&
        fs.existsSync(
          backFile.path
        )
      ) {
        fs.unlinkSync(
          backFile.path
        );

        console.log(
          "Local back file deleted."
        );
      }
    } catch (
      deleteError
    ) {
      console.error(
        "Back file delete error:",
        deleteError.message
      );
    }
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL DOCUMENTS
|--------------------------------------------------------------------------
|
| Existing API
|
| Client:
|   GET /documents
|
| Admin:
|   GET /documents
|   GET /documents?clientId=CLIENT_ID
|
|--------------------------------------------------------------------------
*/

export const getAllDocuments =
  async (req, res) => {
    try {
      let filter = {};
      console.log("hiiiiii ashish ");
      // -----------------------------------------
      // CLIENT
      // -----------------------------------------

      if (
        req.user.role ===
        "client"
      ) {
        const clientProfile =
          await Client.findOne({
            email:
              req.user.email,
          });

        if (!clientProfile) {
          filter = {
            NewClient_id:
              req.user._id,
          };
        } else {
          filter = {
            $or: [
              {
                NewClient_id:
                  clientProfile._id,
              },
              {
                NewClient_id:
                  req.user._id,
              },
            ],
          };
        }
      }

      // -----------------------------------------
      // ADMIN / SUPER ADMIN
      // -----------------------------------------

      else if (
        req.user.role ===
          "super_admin" ||
        req.user.role ===
          "admin"
      ) {
        if (
          req.query.clientId &&
          mongoose.Types.ObjectId.isValid(
            req.query.clientId
          )
        ) {
          const clientProfile =
            await Client.findById(
              req.query.clientId
            );

          if (clientProfile) {
            filter = {
              $or: [
                {
                  NewClient_id:
                    clientProfile._id,
                },
                {
                  NewClient_id:
                    clientProfile.createdBy,
                },
              ],
            };
          } else {
            const clientProfileByUser =
              await Client.findOne({
                createdBy:
                  req.query.clientId,
              });

            if (
              clientProfileByUser
            ) {
              filter = {
                $or: [
                  {
                    NewClient_id:
                      clientProfileByUser._id,
                  },
                  {
                    NewClient_id:
                      req.query.clientId,
                  },
                ],
              };
            } else {
              filter = {
                NewClient_id:
                  req.query.clientId,
              };
            }
          }
        }
      }

      // -----------------------------------------
      // OTHER ROLE
      // -----------------------------------------

      else {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden.",
        });
      }

      const documents =
        await Document.find(
          filter
        ).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        count:
          documents.length,
        data: documents,
      });
    } catch (error) {
      console.error(
        "getAllDocuments error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| ADMIN - GET CLIENT UPLOADS
|--------------------------------------------------------------------------
|
| NEW API FOR ADMIN DASHBOARD
|
| GET /api/admin/cloudinary/uploads
|
| Ye MongoDB se documents lega aur client-wise group karega.
|
|--------------------------------------------------------------------------
*/

export const getAdminClientUploads =
  async (req, res) => {
    try {
      // -----------------------------------------
      // ADMIN CHECK
      // -----------------------------------------

      if (
        req.user.role !==
          "admin" &&
        req.user.role !==
          "super_admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden.",
          clients: [],
          uploads: [],
        });
      }

      // -----------------------------------------
      // GET ALL DOCUMENTS
      // -----------------------------------------

      const documents =
        await Document.find({})
          .sort({
            createdAt: -1,
          })
          .lean();

      // -----------------------------------------
      // GET UNIQUE CLIENT IDS
      // -----------------------------------------

      const rawClientIds =
        documents
          .map(
            (document) =>
              document.NewClient_id
          )
          .filter(Boolean);

      const validObjectIds =
        rawClientIds.filter(
          (id) =>
            mongoose.Types.ObjectId.isValid(
              id
            )
        );

      // -----------------------------------------
      // GET CLIENT PROFILES
      // -----------------------------------------

      let clients = [];

      if (
        validObjectIds.length
      ) {
        clients =
          await Client.find({
            $or: [
              {
                _id: {
                  $in:
                    validObjectIds,
                },
              },
              {
                createdBy: {
                  $in:
                    validObjectIds,
                },
              },
            ],
          })
            .select(
              [
                "_id",
                "clientName",
                "companyName",
                "email",
                "phone",
                "address",
                "city",
                "state",
                "pincode",
                "gstNumber",
                "createdBy",
              ].join(" ")
            )
            .lean();
      }

      // -----------------------------------------
      // CLIENT MAP
      // -----------------------------------------

      const clientMap =
        new Map();

      clients.forEach(
        (client) => {
          clientMap.set(
            String(
              client._id
            ),
            client
          );

          if (
            client.createdBy
          ) {
            clientMap.set(
              String(
                client.createdBy
              ),
              client
            );
          }
        }
      );

      // -----------------------------------------
      // NORMALIZE DOCUMENTS
      // -----------------------------------------

      const normalizedDocuments =
        documents.map(
          (document) => {
            const client =
              clientMap.get(
                String(
                  document.NewClient_id
                )
              );

            return {
              id:
                document._id,

              clientId:
                client?._id ||
                document.NewClient_id,

              clientName:
                client?.clientName ||
                document.name ||
                "Unknown Client",

              companyName:
                client?.companyName ||
                "",

              clientEmail:
                client?.email ||
                document.email ||
                "",

              phone:
                client?.phone ||
                "",

              title:
                document.title ||
                "",

              documentType:
                document.documentType ||
                "",

              description:
                document.description ||
                "",

              fileName:
                document.fileName ||
                "Untitled",

              fileType:
                document.fileType ||
                "",

              fileSize:
                Number(
                  document.fileSize ||
                    0
                ),

              fileUrl:
                document.fileUrl ||
                "",

              secureUrl:
                document.fileUrl ||
                "",

              publicId:
                document.publicId ||
                "",

              resourceType:
                document.resourceType ||
                "image",

              createdAt:
                document.createdAt,

              updatedAt:
                document.updatedAt,

              // -----------------------------------------
              // BACK FILE
              // -----------------------------------------

              backFile:
                document.backFileUrl
                  ? {
                      fileName:
                        document.backFileName ||
                        "Back Side",

                      fileType:
                        document.backFileType ||
                        "",

                      fileSize:
                        Number(
                          document.backFileSize ||
                            0
                        ),

                      fileUrl:
                        document.backFileUrl,

                      publicId:
                        document.backPublicId ||
                        "",

                      resourceType:
                        document.backResourceType ||
                        "image",
                    }
                  : null,
            };
          }
        );

      // -----------------------------------------
      // GROUP BY CLIENT
      // -----------------------------------------

      const clientGroups =
        new Map();

      normalizedDocuments.forEach(
        (document) => {
          const groupId =
            String(
              document.clientId ||
                document.clientEmail ||
                document.NewClient_id ||
                "unknown"
            );

          if (
            !clientGroups.has(
              groupId
            )
          ) {
            clientGroups.set(
              groupId,
              {
                id: groupId,

                clientId:
                  document.clientId ||
                  "",

                clientName:
                  document.clientName ||
                  "Unknown Client",

                companyName:
                  document.companyName ||
                  "",

                clientEmail:
                  document.clientEmail ||
                  "",

                phone:
                  document.phone ||
                  "",

                totalFiles: 0,

                totalBytes: 0,

                latestUpload:
                  document.createdAt ||
                  null,

                files: [],
              }
            );
          }

          const group =
            clientGroups.get(
              groupId
            );

          // -----------------------------------------
          // PRIMARY FILE
          // -----------------------------------------

          group.files.push(
            document
          );

          group.totalFiles +=
            1;

          group.totalBytes +=
            Number(
              document.fileSize ||
                0
            );

          // -----------------------------------------
          // BACK FILE
          // -----------------------------------------

          if (
            document.backFile
          ) {
            group.files.push({
              ...document.backFile,

              id: `${document.id}-back`,

              clientId:
                document.clientId,

              clientName:
                document.clientName,

              companyName:
                document.companyName,

              clientEmail:
                document.clientEmail,

              title:
                `${
                  document.title ||
                  "Document"
                } - Back Side`,

              documentType:
                document.documentType,

              createdAt:
                document.createdAt,

              isBackFile:
                true,

              parentDocumentId:
                document.id,
            });

            group.totalFiles +=
              1;

            group.totalBytes +=
              Number(
                document.backFile
                  .fileSize ||
                  0
              );
          }

          // -----------------------------------------
          // LATEST UPLOAD
          // -----------------------------------------

          const currentDate =
            document.createdAt
              ? new Date(
                  document.createdAt
                ).getTime()
              : 0;

          const latestDate =
            group.latestUpload
              ? new Date(
                  group.latestUpload
                ).getTime()
              : 0;

          if (
            currentDate >
            latestDate
          ) {
            group.latestUpload =
              document.createdAt;
          }
        }
      );

      // -----------------------------------------
      // CONVERT MAP TO ARRAY
      // -----------------------------------------

      const groupedClients =
        Array.from(
          clientGroups.values()
        );

      // -----------------------------------------
      // SORT FILES
      // -----------------------------------------

      groupedClients.forEach(
        (client) => {
          client.files.sort(
            (a, b) =>
              new Date(
                b.createdAt ||
                  0
              ).getTime() -
              new Date(
                a.createdAt ||
                  0
              ).getTime()
          );
        }
      );

      // -----------------------------------------
      // SORT CLIENTS
      // -----------------------------------------

      groupedClients.sort(
        (a, b) =>
          new Date(
            b.latestUpload ||
              0
          ).getTime() -
          new Date(
            a.latestUpload ||
              0
          ).getTime()
      );

      // -----------------------------------------
      // TOTALS
      // -----------------------------------------

      const totalFiles =
        normalizedDocuments.length +
        normalizedDocuments.filter(
          (document) =>
            Boolean(
              document.backFile
            )
        ).length;

      const totalStorage =
        groupedClients.reduce(
          (
            total,
            client
          ) =>
            total +
            Number(
              client.totalBytes ||
                0
            ),
          0
        );

      // -----------------------------------------
      // RESPONSE
      // -----------------------------------------

      return res.status(200).json({
        success: true,

        message:
          "Client uploads fetched successfully.",

        totalClients:
          groupedClients.length,

        totalDocuments:
          normalizedDocuments.length,

        totalFiles,

        totalStorage,

        clients:
          groupedClients,

        uploads:
          normalizedDocuments,
      });
    } catch (error) {
      console.error(
        "======================================"
      );

      console.error(
        "[Admin Uploads Error]"
      );

      console.error({
        message:
          error.message,

        name:
          error.name,

        stack:
          error.stack,
      });

      console.error(
        "======================================"
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to fetch client uploads.",

        clients: [],

        uploads: [],
      });
    }
  };

/*
|--------------------------------------------------------------------------
| DELETE DOCUMENT
|--------------------------------------------------------------------------
*/

export const deleteDocument =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      // -----------------------------------------
      // VALIDATE OBJECT ID
      // -----------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid document id.",
        });
      }

      // -----------------------------------------
      // FIND DOCUMENT
      // -----------------------------------------

      const document =
        await Document.findById(
          id
        );

      if (!document) {
        return res.status(404).json({
          success: false,
          message:
            "Document not found.",
        });
      }

      // -----------------------------------------
      // VALIDATE OWNERSHIP
      // -----------------------------------------

      if (
        req.user.role ===
        "client"
      ) {
        const clientProfile =
          await Client.findOne({
            email:
              req.user.email,
          });

        const isOwner =
          (clientProfile &&
            String(
              document.NewClient_id
            ) ===
              String(
                clientProfile._id
              )) ||
          String(
            document.NewClient_id
          ) ===
            String(
              req.user._id
            );

        if (!isOwner) {
          return res.status(403).json({
            success: false,
            message:
              "Forbidden: You are not authorized to delete this document.",
          });
        }
      } else if (
        req.user.role !==
          "super_admin" &&
        req.user.role !==
          "admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden.",
        });
      }

      // -----------------------------------------
      // DELETE PRIMARY CLOUDINARY FILE
      // -----------------------------------------

      if (
        document.publicId
      ) {
        await cloudinary.uploader.destroy(
          document.publicId,
          {
            resource_type:
              document.resourceType ||
              "image",
          }
        );
      }

      // -----------------------------------------
      // DELETE BACK CLOUDINARY FILE
      // -----------------------------------------

      if (
        document.backPublicId
      ) {
        await cloudinary.uploader.destroy(
          document.backPublicId,
          {
            resource_type:
              document.backResourceType ||
              "image",
          }
        );
      }

      // -----------------------------------------
      // DELETE MONGODB DOCUMENT
      // -----------------------------------------

      await Document.findByIdAndDelete(
        id
      );

      return res.status(200).json({
        success: true,
        message:
          "Document deleted successfully.",
      });
    } catch (error) {
      console.error(
        "deleteDocument error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };