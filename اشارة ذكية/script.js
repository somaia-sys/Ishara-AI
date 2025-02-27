document.addEventListener("DOMContentLoaded", function () {
    const startButton = document.getElementById("startCamera");
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const outputText = document.getElementById("output");
    const ctx = canvas.getContext("2d");

    startButton.addEventListener("click", async function () {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.style.display = "block";
            canvas.style.display = "block";
            analyzeVideo();
        } catch (error) {
            alert("حدث خطأ أثناء تشغيل الكاميرا. الرجاء التحقق من الأذونات.");
            console.error("Camera error:", error);
        }
    });

    async function analyzeVideo() {
        const model = await handpose.load();
        setInterval(async () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const predictions = await model.estimateHands(video);
            if (predictions.length > 0) {
                const landmarks = predictions[0].landmarks;
                drawHandPoints(landmarks);
                const gesture = recognizeGesture(landmarks);
                outputText.innerText = `الإشارة المكتشفة: ${gesture}`;
            } else {
                outputText.innerText = "لم يتم التعرف على يد.";
            }
        }, 500);
    }

    function drawHandPoints(landmarks) {
        ctx.fillStyle = "red";
        for (let i = 0; i < landmarks.length; i++) {
            const [x, y] = landmarks[i];
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    function recognizeGesture(landmarks) {
        if (!landmarks || landmarks.length < 21) return "غير معروف";
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        
        if (thumbTip[1] < indexTip[1] && middleTip[1] < ringTip[1] && ringTip[1] < pinkyTip[1]) {
            return "إشارة موافق (OK)";
        } else if (indexTip[1] < thumbTip[1] && middleTip[1] < thumbTip[1]) {
            return "إشارة السلام";
        } else if (indexTip[1] < middleTip[1] && middleTip[1] < ringTip[1] && ringTip[1] < pinkyTip[1]) {
            return "إشارة اليد المفتوحة";
        } else {
            return "إشارة غير معروفة";
        }
    }
});
