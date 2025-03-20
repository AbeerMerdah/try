let mediaRecorder;

let audioChunks = [];

let audioBlob = null;

let imageFile = null;



// ⏺️ بدء التسجيل

document.getElementById('start-recording').addEventListener('click', async () => {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream);

        audioChunks = [];



        mediaRecorder.start();

        document.getElementById('start-recording').disabled = true;

        document.getElementById('stop-recording').disabled = false;



        mediaRecorder.ondataavailable = event => {

            audioChunks.push(event.data);

        };



        mediaRecorder.onstop = () => {

            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            const audioUrl = URL.createObjectURL(audioBlob);



            const audioElement = document.getElementById('audio');

            audioElement.src = audioUrl;

            audioElement.style.display = 'block';

            audioElement.controls = true;



            document.getElementById('save-to-camera-roll').style.display = 'block'; // إظهار زر الحفظ بعد التسجيل

        };

    } catch (error) {

        console.error("حدث خطأ في الميكروفون:", error);

        alert("يرجى السماح بالوصول إلى الميكروفون من إعدادات الجهاز.");

    }

});



// ⏹️ إيقاف التسجيل

document.getElementById('stop-recording').addEventListener('click', () => {

    if (mediaRecorder) {

        mediaRecorder.stop();

    }

    document.getElementById('start-recording').disabled = false;

    document.getElementById('stop-recording').disabled = true;

});



// 📷 تحميل الصورة

document.getElementById('upload-image').addEventListener('click', () => {

    const imageInput = document.getElementById('image-upload');

    const previewImage = document.getElementById('preview-image');



    if (imageInput.files.length > 0) {

        imageFile = imageInput.files[0];

        const reader = new FileReader();



        reader.onload = function(event) {

            previewImage.src = event.target.result;

            previewImage.style.display = 'block';



            document.getElementById('save-to-camera-roll').style.display = 'block'; // إظهار زر الحفظ بعد تحميل الصورة

        };



        reader.readAsDataURL(imageFile);

    } else {

        alert("يرجى تحميل صورة.");

    }

});



// 🎥 حفظ الفيديو مع الصوت

document.getElementById('save-to-camera-roll').addEventListener('click', async () => {

    if (!audioBlob || !imageFile) {

        alert("يرجى تسجيل الصوت وتحميل صورة أولًا.");

        return;

    }



    const canvas = document.createElement('canvas');

    const context = canvas.getContext('2d');

    const image = new Image();



    image.src = document.getElementById('preview-image').src;

    await new Promise(resolve => image.onload = resolve);



    canvas.width = image.width;

    canvas.height = image.height;

    context.drawImage(image, 0, 0);



    // تحويل الـ canvas إلى فيديو

    const stream = canvas.captureStream(30);

    const videoChunks = [];

    const videoRecorder = new MediaRecorder(stream);



    videoRecorder.ondataavailable = event => videoChunks.push(event.data);

    videoRecorder.onstop = async () => {

        const videoBlob = new Blob(videoChunks, { type: 'video/webm' });

        const finalVideoBlob = await mergeAudioWithVideo(videoBlob, audioBlob);



        const finalVideoUrl = URL.createObjectURL(finalVideoBlob);

        const a = document.createElement('a');

        a.href = finalVideoUrl;

        a.download = 'eid_greeting_card.mp4';

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);



        alert("🎉 تم حفظ الفيديو مع الصوت بنجاح!");

    };



    videoRecorder.start();

    new Audio(URL.createObjectURL(audioBlob)).play();



    setTimeout(() => videoRecorder.stop(), 3000); // تسجيل فيديو لمدة 3 ثوانٍ

});



// 🛠️ دمج الصوت مع الفيديو

async function mergeAudioWithVideo(videoBlob, audioBlob) {

    return new Promise(resolve => {

        const reader1 = new FileReader();

        const reader2 = new FileReader();



        reader1.readAsArrayBuffer(videoBlob);

        reader2.readAsArrayBuffer(audioBlob);



        reader1.onload = () => {

            reader2.onload = () => {

                const videoBuffer = new Uint8Array(reader1.result);

                const audioBuffer = new Uint8Array(reader2.result);



                const combinedBuffer = new Uint8Array(videoBuffer.length + audioBuffer.length);

                combinedBuffer.set(videoBuffer, 0);

                combinedBuffer.set(audioBuffer, videoBuffer.length);



                resolve(new Blob([combinedBuffer], { type: 'video/mp4' }));

            };

        };

    });

}

