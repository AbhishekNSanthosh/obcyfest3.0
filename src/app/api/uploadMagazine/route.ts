// src/app/api/uploadMagazine/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import { Bucket } from "@google-cloud/storage";
import sharp from "sharp";

// Initialize Firebase Admin
function initializeFirebase() {
    if (!admin.apps.length) {
        const requiredEnvVars = [
            'FIREBASE_PROJECTID',
            'FIREBASE_CLIENT_EMAIL',
            'FIREBASE_PRIVATE_KEY',
            'FIREBASE_STORAGEBUCKET'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }

        const privateKey = process.env.FIREBASE_PRIVATE_KEY!
            .replace(/\\n/g, '\n')
            .replace(/^"|"$/g, '');

        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECTID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
                storageBucket: process.env.FIREBASE_STORAGEBUCKET,
            });
            console.log("Firebase Admin initialized successfully");
        } catch (error) {
            console.error("Firebase initialization error:", error);
            throw error;
        }
    }
    return admin.storage().bucket();
}

let bucket: Bucket | undefined;

interface UploadedFileInfo {
    url: string;
    name: string;
    size: number;
}

try {
    bucket = initializeFirebase();
} catch (error) {
    console.error("Failed to initialize Firebase:", error);
}

// Safe image processor with comprehensive error handling
async function safeProcessImage(buffer: Buffer, originalName: string, originalType: string): Promise<{ buffer: Buffer; contentType: string; processed: boolean }> {
    // Skip processing for non-image files
    if (!originalType.startsWith('image/')) {
        return { buffer, contentType: originalType, processed: false };
    }

    // Skip processing for GIFs and WebP to avoid issues
    if (originalType === 'image/gif' || originalType === 'image/webp') {
        console.log(`Skipping processing for ${originalName} (${originalType})`);
        return { buffer, contentType: originalType, processed: false };
    }

    try {
        // Validate the buffer first
        if (!buffer || buffer.length === 0) {
            throw new Error('Empty buffer');
        }

        let processedBuffer: Buffer;
        let outputContentType: string;

        // Special handling for PNG files
        if (originalType === 'image/png') {
            try {
                // Try to process PNG with specific settings
                const image = sharp(buffer);
                const metadata = await image.metadata();
                
                // Check if we can actually process this image
                if (metadata.width && metadata.height) {
                    processedBuffer = await image
                        .resize({
                            width: Math.min(1200, metadata.width),
                            height: Math.min(1200, metadata.height),
                            fit: 'inside',
                            withoutEnlargement: true
                        })
                        .png({ 
                            quality: 80,
                            compressionLevel: 9 
                        })
                        .toBuffer();
                    outputContentType = "image/png";
                } else {
                    throw new Error('Invalid image metadata');
                }
            } catch (pngError) {
                console.warn(`PNG processing failed for ${originalName}, falling back to JPEG:`, pngError);
                // Fallback: convert PNG to JPEG
                processedBuffer = await sharp(buffer)
                    .resize({
                        width: 1200,
                        height: 1200,
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .jpeg({
                        quality: 80,
                        progressive: true
                    })
                    .toBuffer();
                outputContentType = "image/jpeg";
            }
        } else {
            // For JPEG and other supported formats
            processedBuffer = await sharp(buffer)
                .resize({
                    width: 1200,
                    height: 1200,
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({
                    quality: 80,
                    progressive: true,
                    mozjpeg: true
                })
                .toBuffer();
            outputContentType = "image/jpeg";
        }

        return { 
            buffer: processedBuffer, 
            contentType: outputContentType, 
            processed: true 
        };

    } catch (error) {
        console.warn(`Image processing completely failed for ${originalName}, using original file:`, error);
        return { 
            buffer, 
            contentType: originalType, 
            processed: false 
        };
    }
}

export async function POST(request: NextRequest) {
    // Check if Firebase was initialized properly
    if (!bucket) {
        return NextResponse.json(
            { error: "Server configuration error: Firebase not initialized" },
            { status: 500 }
        );
    }

    try {
        // Get the form data from the request
        const formData = await request.formData();
        const files = formData.getAll('file') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        // Validate file types
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
        const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate file sizes (optional - 10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        const oversizedFiles = files.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            return NextResponse.json(
                { error: `Files exceed maximum size of 10MB: ${oversizedFiles.map(f => f.name).join(', ')}` },
                { status: 400 }
            );
        }

        const uploadedFiles: UploadedFileInfo[] = [];

        for (const file of files) {
            try {
                // Generate unique filename
                const timestamp = Date.now();
                const originalName = file.name;
                const fileExtension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
                const fileName = originalName.replace(/\.[^/.]+$/, ""); // Remove extension
                const uniqueFileName = `${fileName}-${timestamp}.${fileExtension}`;

                const destination = `magazines/${uniqueFileName}`;

                // Convert File to Buffer
                const arrayBuffer = await file.arrayBuffer();
                let uploadBuffer: Buffer = Buffer.from(arrayBuffer);
                let contentType = file.type;

                // Only attempt to process image files
                if (file.type.startsWith('image/')) {
                    try {
                        const processed = await safeProcessImage(uploadBuffer, originalName, file.type);
                        uploadBuffer = processed.buffer;
                        contentType = processed.contentType;
                        
                        if (processed.processed) {
                            console.log(`Successfully processed: ${originalName}`);
                        } else {
                            console.log(`Used original file for: ${originalName}`);
                        }
                    } catch (processingError) {
                        console.error(`Image processing failed for ${originalName}, using original:`, processingError);
                        // Keep original buffer and content type
                    }
                }

                // Upload to Firebase Storage
                const fileRef = bucket.file(destination);
                
                const metadata = {
                    contentType: contentType,
                    metadata: {
                        originalName: originalName,
                        uploadedAt: new Date().toISOString(),
                        originalSize: file.size,
                        processedSize: uploadBuffer.length,
                    }
                };

                await fileRef.save(uploadBuffer, {
                    metadata: metadata,
                    public: true,
                });

                // Make the file publicly accessible
                await fileRef.makePublic();

                // Get public URL
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
                uploadedFiles.push({
                    url: publicUrl,
                    name: originalName,
                    size: uploadBuffer.length
                });

                console.log(`Successfully uploaded: ${originalName} (${Math.round(uploadBuffer.length / 1024)}KB)`);

            } catch (fileError: any) {
                console.error(`Error processing file ${file.name}:`, fileError);
                
                // Provide more specific error information
                if (fileError.code === 'ERR_OSSL_UNSUPPORTED') {
                    console.error(`Unsupported file format or corrupted image: ${file.name}`);
                }
                
                // Continue with other files even if one fails
                continue;
            }
        }

        if (uploadedFiles.length === 0) {
            return NextResponse.json(
                { error: "All files failed to upload. Please check file formats and try again." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            uploadedFiles,
            message: `Successfully uploaded ${uploadedFiles.length} out of ${files.length} files`
        });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

// Add OPTIONS handler for CORS if needed
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}