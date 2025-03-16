let mediaRecorder;

let audioChunks = [];

let audioBlob;

let audioUrl;



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

            audioUrl = URL.createObjectURL(audioBlob);



            const audioElement = document.getElementById('audio');

            audioElement.src = audioUrl;

            audioElement.style.display = 'block';



            document.getElementById('preview-audio').src = audioUrl;

            document.getElementById('preview-audio').style.display = 'block';

        };

    } catch (error) {

        alert("❌ يرجى السماح بالوصول إلى الميكروفون من إعدادات الجهاز.");

    }

});



document.getElementById('stop-recording').addEventListener('click', () => {

    if (mediaRecorder) {

        mediaRecorder.stop();

    }

    document.getElementById('start-recording').disabled = false;

    document.getElementById('stop-recording').disabled = true;

});



document.getElementById('upload-image').addEventListener('click', () => {

    const imageInput = document.getElementById('image-upload');

    const previewImage = document.getElementById('preview-image');

    const saveButton = document.getElementById('save-to-camera-roll');



    if (imageInput.files.length > 0) {

        const file = imageInput.files[0];

        const reader = new FileReader();



        reader.onload = function(event) {

            previewImage.src = event.target.result;

            previewImage.style.display = 'block';

            saveButton.style.display = 'block';

        };



        reader.readAsDataURL(file);

    } else {

        alert("❌ يرجى تحميل صورة.");

    }

});



document.getElementById('save-to-camera-roll').addEventListener('click', async () => {

    if (!audioBlob || !document.getElementById('preview-image').src) {

        alert("❌ يرجى تسجيل الصوت وتحميل صورة أولًا.");

        return;

    }



    const canvas = document.createElement('canvas');

    const context = canvas.getContext('2d');

    const image = new Image();

    image.src = document.getElementById('preview-image').src;



    image.onload = async () => {

        canvas.width = image.width;

        canvas.height = image.height;

        context.drawImage(image, 0, 0);



        const stream = canvas.captureStream(30);

        const audioContext = new AudioContext();

        const source = audioContext.createMediaElementSource(new Audio(audioUrl));

        const destination = audioContext.createMediaStreamDestination();

        source.connect(destination);

        source.connect(audioContext.destination);



        const combinedStream = new MediaStream([...stream.getTracks(), ...destination.stream.getTracks()]);

        const mediaRecorder = new MediaRecorder(combinedStream);

        const videoChunks = [];



        mediaRecorder.ondataavailable = event => {

            videoChunks.push(event.data);

        };



        mediaRecorder.onstop = () => {

            const videoBlob = new Blob(videoChunks, { type: 'video/webm' });

            const videoUrl = URL.createObjectURL(videoBlob);

            const a = document.createElement('a');

            a.href = videoUrl;

            a.download = 'eid_greeting_card.webm';

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

            alert("✅ تم حفظ الفيديو مع الصوت!");

        };



        mediaRecorder.start();

        const audio = new Audio(audioUrl);

        audio.play();



        audio.onended = () => {

            mediaRecorder.stop();

        };

    };

});

