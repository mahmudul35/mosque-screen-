export const uploadToCloudinary = async (file: File): Promise<string> => {
  const CLOUD_NAME = "dkhsk0fyb";
  const API_KEY = "552235984823254";
  const API_SECRET = "VF9D7jNtYDxd03pDwmTlo_mT_1A";

  const timestamp = Math.round(new Date().getTime() / 1000).toString();

  // Create signature
  // The signature string should be "timestamp=1234567890" + API_SECRET
  const signatureString = `timestamp=${timestamp}${API_SECRET}`;
  
  // Hash the signature using SHA-1
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureString);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const uploadResult = await response.json();
  if (uploadResult.secure_url) {
    return uploadResult.secure_url;
  } else {
    throw new Error(uploadResult.error?.message || "Upload failed");
  }
};
