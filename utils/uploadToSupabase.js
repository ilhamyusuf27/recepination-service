const supabase = require("../lib/supabase");
const path = require("path");

const uploadToSupabase = async (file, bucketName, folderName = "public") => {
  const fileExt = path.extname(file.originalname);
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}${fileExt}`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(`${folderName}/${fileName}`, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    console.log("Supabase error:", error);
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return data.publicUrl;
};

module.exports = uploadToSupabase;