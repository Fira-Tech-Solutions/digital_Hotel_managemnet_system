// POST /api/admin/uploads  (multipart/form-data, field name "file")
// Returns a publicly accessible URL for the uploaded file.
// Swap this for S3/Supabase Storage in production — local disk is fine
// for getting started but won't survive most PaaS redeploys.
exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const publicBase = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const url = `${publicBase}/uploads/${req.file.filename}`;

  res.status(201).json({ success: true, data: { url } });
};
