"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export default function MediaUploader({
  media = [],
  onChange,
  folder = "rani-cook",
  multiple = true,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError("");

    try {
      const uploaded = [];

      for (const file of files) {
        const mediaType = file.type.startsWith("video/")
          ? "video"
          : "image";


        // Get Cloudinary signed upload data
        const sigRes = await fetch("/api/upload-signature", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            folder,
          }),
        });


        const sigText = await sigRes.text();

        let sigData;

        try {
          sigData = JSON.parse(sigText);
        } catch {
          throw new Error(
            `Could not get upload permission: ${sigText.slice(0, 100)}`
          );
        }


        if (!sigRes.ok) {
          throw new Error(
            sigData.error || "Signature request failed"
          );
        }


        const {
          signature,
          timestamp,
          apiKey,
          cloudName,
          folder: signedFolder,
        } = sigData;


        if (!apiKey || !cloudName) {
          throw new Error(
            "Cloudinary is not configured correctly."
          );
        }



        // Upload directly to Cloudinary
        const cloudForm = new FormData();

        cloudForm.append(
          "file",
          file
        );

        cloudForm.append(
          "api_key",
          apiKey
        );

        cloudForm.append(
          "timestamp",
          timestamp
        );

        cloudForm.append(
          "signature",
          signature
        );

        cloudForm.append(
          "folder",
          signedFolder
        );



        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${mediaType}/upload`,
          {
            method: "POST",
            body: cloudForm,
          }
        );


        const uploadText = await uploadRes.text();

        let uploadData;

        try {
          uploadData = JSON.parse(uploadText);
        } catch {
          throw new Error(
            `Cloudinary response error: ${uploadText.slice(0, 150)}`
          );
        }



        if (!uploadRes.ok) {
          throw new Error(
            uploadData.error?.message ||
              "Cloudinary upload failed"
          );
        }



        // IMPORTANT: Save as type
        uploaded.push({
          url: uploadData.secure_url,
          publicId: uploadData.public_id,
          type: mediaType,
        });
      }



      onChange(
        multiple
          ? [...media, ...uploaded]
          : uploaded
      );


    } catch (err) {

      setError(err.message);

    } finally {

      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

    }
  }



  function removeMedia(index) {
    onChange(
      media.filter(
        (_, i) => i !== index
      )
    );
  }



  return (
    <div>

      <div className="flex flex-wrap gap-3">

        {media.map((item, index) => (

          <div
            key={item.publicId || index}
            className="relative h-24 w-24 overflow-hidden rounded-lg border"
          >

            {(item.type || item.mediaType) === "video" ? (

              <video
                src={item.url}
                className="h-full w-full object-cover"
                controls
              />

            ) : item.url ? (

              <Image
                src={item.url}
                alt="Product image"
                fill
                className="object-cover"
              />

            ) : (

              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                No image
              </div>

            )}



            <button
              type="button"
              onClick={() => removeMedia(index)}
              className="absolute right-1 top-1 h-5 w-5 rounded-full bg-black text-white"
            >
              ×
            </button>


          </div>

        ))}



        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed"
        >
          {uploading
            ? "Uploading..."
            : "+ Add"}
        </button>


      </div>



      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple={multiple}
        onChange={handleFiles}
        className="hidden"
      />



      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}

    </div>
  );
}