const express = require('express');

const multer = require('multer');

const ffmpeg = require('fluent-ffmpeg');

const path = require('path');

const fs = require('fs');



const app = express();

const upload = multer({ dest: 'uploads/' });



// تعريف route لاستقبال الصوت والصورة

app.post('/merge', upload.fields([{ name: 'audio' }, { name: 'image' }]), (req, res) => {

    const audioPath = req.files['audio'][0].path;

    const imagePath = req.files['image'][0].path;

    const outputPath = path.join(__dirname, 'output.mp4');



    // استخدام FFmpeg لدمج الصوت مع الصورة

    ffmpeg()

        .input(imagePath)

        .input(audioPath)

        .outputOptions('-c:v libx264')

        .outputOptions('-c:a aac')

        .output(outputPath)

        .on('end', () => {

            // إرسال الفيديو النهائي إلى العميل

            res.download(outputPath, 'video.mp4', () => {

                // حذف الملفات المؤقتة بعد الانتهاء

                fs.unlinkSync(audioPath);

                fs.unlinkSync(imagePath);

                fs.unlinkSync(outputPath);

            });

        })

        .on('error', (err) => {

            console.error("⚠️ خطأ أثناء معالجة الفيديو:", err);

            res.status(500).send("حدث خطأ أثناء معالجة الفيديو.");

        })

        .run();

});



// بدء الخادم على المنفذ المحدد (أو 3000 افتراضيًا)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`الخادم يعمل على http://localhost:${PORT}`);

});

