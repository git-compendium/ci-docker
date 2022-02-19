const Jimp = require('jimp');
const express = require('express');
const multer = require('multer');

const upload = multer();
const debug = require('debug')('api');
const eparser = require('exif-parser');

const router = express.Router();
const uuid = require('uuid');

router.get('/pictures', (req, res) => {
  const rows = req.app.get('db').prepare('SELECT * from pic').all();
  res.json({ data: rows });
});
router.post('/picture', upload.single('file'), (req, res) => {
  debug('Files uploaded: ', req.file);
  let origDate = Date.now();
  let hasExif = 0;
  if (req.file.mimetype === 'image/jpeg') {
    const parser = eparser.create(req.file.buffer);
    const exif = parser.parse();
    debug('EXIF is: ', exif);
    if (exif.tags && exif.tags.DateTimeOriginal) {
      hasExif = 1;
      origDate = exif.tags.DateTimeOriginal;
      debug('exifdate: ', origDate);
    }
  }
  Jimp.read(req.file.buffer).then((image) => {
    image.cover(200, 200)
      .getBuffer(req.file.mimetype, (err, buff) => {
        const entry = [uuid.v1(), origDate, Buffer.from(buff, 'base64'), req.file.mimetype, req.file.size, hasExif];
        const query = 'INSERT INTO pic (id, date, thumbnail, mime, size, hasExif) VALUES (?,?,?,?,?,?)';
        const data = req.app.get('db').prepare(query).run(entry);
        res.json({ data });
      });
  });
});
router.delete('/picture/:id', (req, res) => {
  debug('delete for ', req.params.id);
  const data = req.app.get('db').prepare('DELETE FROM pic WHERE id = ?').run([req.params.id]);
  res.json({ data });
});

module.exports = router;
