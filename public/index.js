// Download Feild 
// const clipboard = FlowbiteInstances.getInstance('CopyClipboard', 'download-url');
// const tooltip = FlowbiteInstances.getInstance('Tooltip', 'tooltip-copy-download-url');

// const $defaultIcon = document.getElementById('default-icon');
// const $successIcon = document.getElementById('success-icon');

// const $defaultTooltipMessage = document.getElementById('default-tooltip-message');
// const $successTooltipMessage = document.getElementById('success-tooltip-message');

// clipboard.updateOnCopyCallback((clipboard) => {
//     showSuccess();

//     // reset to default state
//     setTimeout(() => {
//         resetToDefault();
//     }, 2000);
// })

// const showSuccess = () => {
//     $defaultIcon.classList.add('hidden');
//     $successIcon.classList.remove('hidden');
//     $defaultTooltipMessage.classList.add('hidden');
//     $successTooltipMessage.classList.remove('hidden');
//     tooltip.show();
// }

// const resetToDefault = () => {
//     $defaultIcon.classList.remove('hidden');
//     $successIcon.classList.add('hidden');
//     $defaultTooltipMessage.classList.remove('hidden');
//     $successTooltipMessage.classList.add('hidden');
//     tooltip.hide();
// }

// Upload Fuctionality
const dropArea = document.getElementById("drop-area");
const inputFile = document.getElementById("dropzone-file");
const progressBar = document.getElementById("progressBar");
const progress_bar = document.getElementById("progress-bar");
const progress_tick = document.getElementById("progress-tick");
const progress_logo = document.getElementById("progress-logo");
const progress_loader = document.getElementById("progress-loader");
const total_files = document.getElementById("total-files");
const downloadURLFeild = document.getElementById("downloadurl");
const download_url = document.getElementById("download-url");
const after_upload = document.getElementById("after-upload");
const cloud = document.getElementById("cloud");
const email_form = document.getElementById("email-form");
const email_toast = document.getElementById("email-toast");
const formBtn = document.getElementById("formbtn");

const host = "http://localhost:3000";
const uploadAPI = `${host}/api/upload`;
const mailAPI = `${uploadAPI}/mail`

// Animating on hover
dropArea.addEventListener("mouseover", (e) => {
    e.preventDefault();
    if (!cloud.classList.contains("animate-bounce")) {
        cloud.classList.add("animate-bounce");
    }
});

dropArea.addEventListener("mouseout", () => {
    cloud.classList.remove("animate-bounce");
});

dropArea.addEventListener("dragleave", () => {
    cloud.classList.remove("animate-bounce");
});

// Animating on hover with file
dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!cloud.classList.contains("animate-bounce")) {
        cloud.classList.add("animate-bounce");
    }
});

// Removing animation & Handeling files
dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    cloud.classList.remove("animate-bounce");

    // File Handeling
    const fileData = e.dataTransfer.files;
    if (fileData.length) {
        inputFile.files = fileData;
        uploadFiles();
    }
});

inputFile.addEventListener('change', (e) => {
    e.preventDefault();
    uploadFiles();
});

// Send contact form data

// Upload File feature
const uploadFiles = () => {
    const files = inputFile.files;
    const len = files.length;
    const formData = new FormData();

    // Appending each file to formData
    for (let i = 0; i < files.length; i++) {
        formData.append("uploadFile", files[i]);
    }

    const req = new XMLHttpRequest();
    req.onreadystatechange = () => {
        if (req.readyState === XMLHttpRequest.DONE) {
            console.log(req.response);
        }
        onUploadSuccess(JSON.parse(req.response));
    };
    if (len > 1) {
        total_files.innerHTML = `${len} Files`;
    }
    req.upload.onprogress = updateProgress;

    req.open("POST", uploadAPI);
    req.send(formData);
};

// Progress bar logic
const updateProgress = (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    console.log(percent);
    if (progressBar.classList.contains("hidden")) {
        progressBar.classList.remove("hidden");
    }
    progress_bar.style.width = `${percent}%`
    if (percent < 100) {
        if (!progress_logo.classList.contains('animate-pulse')) {
            progress_logo.classList.add('animate-pulse');
        }
        if (progress_loader.classList.contains('hidden')) {
            progress_loader.classList.remove('hidden');
        }
        if (!progress_tick.classList.contains('hidden')) {
            progress_tick.classList.add('hidden');
        }
    } else if (percent === 100) {
        if (!progressBar.classList.contains('hidden')) {
            progressBar.classList.add('hidden');
        }
        if (after_upload.classList.contains('hidden')) {
            after_upload.classList.remove('hidden');
        }
        if (progress_logo.classList.contains('animate-pulse')) {
            progress_logo.classList.remove('animate-pulse');
        }
        if (!progress_loader.classList.contains('hidden')) {
            progress_loader.classList.add('hidden');
        }
        if (progress_tick.classList.contains('hidden')) {
            progress_tick.classList.remove('hidden');
        }
    }
}

const onUploadSuccess = ({ downloadURL }) => {
    email_form[3].removeAttribute("disabled");
    email_form[3].classList.remove("cursor-not-allowed");

    download_url.value = "";
    console.log(downloadURL);
    download_url.value = downloadURL;
}

email_form.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = (download_url.value);
    const formData = {
        uuid: url.split('/').splice(-1, 1)[0],
        senderMail: email_form.elements["senderMail"].value,
        receiverMail: email_form.elements["receiverMail"].value
    }

    email_form[3].setAttribute("disabled", "true");
    email_form[3].classList.add("cursor-not-allowed");
    console.table(formData);
    
    fetch(mailAPI, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    }).then((res) => res.json())
    .then(({success}) => {
        showToast("Email Sent Successfylly");
        if (success) {
            setInterval(()=>{
                after_upload.classList.add("hidden");
            },1500);
        }
    });
});

let toastTimer;
const showToast = (msg) => {
    email_toast.innerHTML = msg;
    email_toast.style.transform = "translate(-50%, -55px)";
    clearTimeout();
    toastTimer = setTimeout(() => {
    email_toast.style.transform = "translate(-50%, 60px)";
    }, 2500);
}