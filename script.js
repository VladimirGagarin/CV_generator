document.addEventListener('DOMContentLoaded', () => {
    let userData = JSON.parse(sessionStorage.getItem('userData')) || {}; 
    let initialTexContent = {
        element: null,
        val: null,
        edited: false
    }

    let firSectionEdited = false;

    let isdownloadedCVWithImage = sessionStorage.getItem("isDownloaded") === "true";
    let isdownloadedCVPlainText = sessionStorage.getItem('isTrueDownloaded') === "true";
    let isdownloadedCVPlainTextTXT = sessionStorage.getItem('isTruesDownloaded') === "true";


    const allSection = document.querySelectorAll('main section');
    const firstSection = allSection[0];
    
    const editFirsectionBtn = firstSection.querySelector('button');
    

    const photoName = document.querySelector('.photo-user-name h3');
    const photoSkills = document.querySelector('.photo-user-name p');

    // Restore Name & Skills
    photoName.textContent = userData.Name || "John Doe";
    photoSkills.textContent = Array.isArray(userData.Skills) && userData.Skills.length 
        ? userData.Skills[0] 
        : "Painter";

    // Restore User Image if available
    const photoHolder = firstSection.querySelector('.photo-user .photo-holder img');
    const CVBtn = document.querySelector('header button');
    if (userData.UserImage && userData.UserImage !== "No Image") {
        photoHolder.src = userData.UserImage;
        firSectionEdited = true;

    } else {
        photoHolder.src = "logo.png";  // Fallback to a default image if no user image exists
        firSectionEdited = false;
        
    }
    

    CVBtn.disabled =  !firSectionEdited;

    // Restore Edited Sections
    document.querySelectorAll('main section').forEach(sect => {
            if (sect !== firstSection) {
                const allLis = sect.querySelectorAll('div ul li');
                allLis.forEach(li => {
                    const dataLabel = li.getAttribute('data-label');
                    if (userData[dataLabel]) {
                        li.textContent = Array.isArray(userData[dataLabel]) 
                            ? userData[dataLabel].join(', ') 
                            : userData[dataLabel];
                        li.classList.add('edited');
                }
            });
        }
    });
    

    checkAllInputFilled();

    

    editFirsectionBtn.onclick = function () {
        showEditOverlay();
    }

    allSection.forEach(sect => {
        if(sect !== firstSection) {
            const allLis = sect.querySelectorAll('div ul li');

            allLis.forEach(li => {

                li.onclick = function () {
                    const dataLabel = li.getAttribute('data-label');
                    const dataInputType = li.getAttribute('data-type-input');
                    const dataRequired = li.getAttribute('data-required');
                    initialTexContent.element = li;
                    initialTexContent.val = li.textContent.trim();
                    displayInput(li, dataLabel, dataInputType,dataRequired,initialTexContent)
                }
            });

        }
    });

    let labekHasListAready = [];

    function  displayInput(element, dataLabel, dataInputType,dataRequired, initialContent) {
        if(dataRequired === "single") {
            const overlay = document.querySelector('.input-overlay');
            const closeOverlay = overlay.querySelector('.input-close');
            const inputField = overlay.querySelector('.input-content .controls-inputs input');
            const doneBtn = overlay.querySelector('.input-content .controls-inputs button');
            const labels = overlay.querySelector('.input-content h3');

            inputField.placeholder = "Add " + dataLabel;
            inputField.type = dataInputType;
            setTimeout(() => inputField.focus(), 100);
            inputField.value = userData[dataLabel]? userData[dataLabel] : "";
            labels.textContent = `(${dataLabel}) ` + initialContent.val;

            overlay.style.display = "flex";

            inputField.oninput = function () {
                doneBtn.disabled = inputField.value.trim() === '' || inputField.value.trim() === initialContent.val;
            }

            doneBtn.onclick = function () {
                element.textContent = inputField.value.trim();
                doneBtn.disabled = true;
                initialContent.edited = true;
                initialContent.val = element.textContent;
                initialContent.element.classList.add('edited');
                userData[dataLabel] =  initialContent.val;
                sessionStorage.setItem('userData', JSON.stringify(userData));
                overlay.style.display = 'none';
                doneBtn.disabled = true;
                inputField.value = '';
                checkAllInputFilled();
            }

            closeOverlay.onclick = function () {
                overlay.style.display = 'none';
                doneBtn.disabled = true;
                if(inputField.value.trim() !== '' && inputField.value.trim() === initialContent.val){
                    initialContent.element.classList.toggle('edited',  true);
                }
                checkAllInputFilled();
                inputField.value = '';
                
                

            }
        }

        if (dataRequired === 'multiple') {
            const overlay = document.querySelector('.overlay-multiple-inputs');
            const exiter = overlay.querySelector('.multiple-close');
            const title = overlay.querySelector('.multiple-content h3');
            const contentTitle = document.querySelector('.multiple-content p span');
            const doneBtn = document.querySelector('.multiple-content p button');
            const inputField = document.querySelector('.multiple-content input');
            const contentContainer = document.querySelector('.multiple-content .list-multiples ul');

            title.textContent = `You can add ${dataRequired} ${dataLabel}`;
            contentTitle.textContent = dataLabel;
            inputField.placeholder = `Write your ${dataLabel}(s) here...`;
            setTimeout(() => inputField.focus(), 100);
            inputField.type = dataInputType;
            

            // ✅ Ensure userData[dataLabel] exists
            labekHasListAready = [...new Set(userData[dataLabel] || [])];


            contentContainer.innerHTML = ""; // Always clear the container before adding items
            contentContainer.dataset.currentLabel = dataLabel;


             // Function to create list elements dynamically
            const createLiElements = (val) => {
                // If the value is not already in our list (it shouldn't be, since we just cleared the container)
                if (!labekHasListAready.includes(val)) {
                    labekHasListAready.push(val);
                }

                // Create the <li> element with delete functionality
                const newLi = document.createElement('li');
                newLi.innerHTML = `
                    <div class="textcontent"><span>${val}</span></div>
                    <div class="delete-text"><span>&times;</span></div>`;
                contentContainer.appendChild(newLi);

                // Add delete functionality
                newLi.querySelector('.delete-text').onclick = () => {
                    removeListItem(val, newLi);
                };

                // Disable the done button if no items exist
                doneBtn.disabled = contentContainer.children.length === 0;
            };

            const removeListItem = (val, liElement) => {
                labekHasListAready = labekHasListAready.filter(item => item !== val);
                liElement.remove();
                doneBtn.disabled = contentContainer.children.length === 0;
            };

            

            labekHasListAready.forEach(val => createLiElements(val));

            overlay.style.display = 'flex';

            inputField.addEventListener("keydown", (e) => {
                if (e.key === "#" && inputField.value.trim() !== "") {
                    e.preventDefault(); // Prevent the comma from being typed
                    const val = inputField.value.trim().replace(',', '');
                    createLiElements(val); 
                    inputField.value = "";
                }
            });

            exiter.onclick = function () {
                overlay.style.display = 'none';
                inputField.value = '';
                doneBtn.disabled  = true;
                checkAllInputFilled();
            };

            doneBtn.onclick = function () {
                userData[dataLabel] = [...new Set(labekHasListAready)]; // ✅ Save the correct values
                element.classList.add('edited');
                element.textContent = userData[dataLabel].join(', '); 
                sessionStorage.setItem('userData', JSON.stringify(userData));  // Save
                overlay.style.display = 'none';
                inputField.value = '';
                doneBtn.disabled = true;
                checkAllInputFilled();
            };
        }

        
    }


    function checkAllInputFilled() {
        const CVBtn = document.querySelector('header button');
        const  photoName = firstSection.querySelector('.photo-user-name h3');
        const photoSkills = firstSection.querySelector('.photo-user-name p');
        let isAllFilled = true; // Assume all are filled unless proven otherwise
    
        allSection.forEach(sect => {
            if (sect !== firstSection) {
                const allLis = sect.querySelectorAll('div ul li');
            
                const isSectionFilled = Array.from(allLis).every(li => li.classList.contains("edited"));
    
                // If one section is not filled, set isAllFilled to false
                if (!isSectionFilled) {
                    isAllFilled = false;
                }
            }
        });

        if(!firSectionEdited && isAllFilled) {
            document.documentElement.scrollTop = 0;
            editFirsectionBtn.classList.add('highlighted');

            setTimeout(function () {
                editFirsectionBtn.classList.remove('highlighted');
            });

            showEditOverlay();
        }
    
        // Disable or enable the button based on whether all sections are filled
        CVBtn.disabled = !(isAllFilled && firSectionEdited);
        photoName.textContent = userData.Name ? userData.Name : "John Doe";
        photoSkills.textContent = Array.isArray(userData.Skills) && userData.Skills.length ? userData.Skills[0]  : "Painter";

    }


    function showEditOverlay() {
        const overlay = document.querySelector('.overlay-image-display');
        const closeOverlay = overlay.querySelector('.overlay-img-close');
        const fileInput = overlay.querySelector('.overlay-img-content .top #FileInput');
        const imagepreview = overlay.querySelector('.overlay-img-content .center');
        const imgSrc = imagepreview.querySelector('img');
        const addBtn = overlay.querySelector('.overlay-img-content .bottom button');
        const photoHolder = firstSection.querySelector('.photo-user .photo-holder img');
        const photoName = firstSection.querySelector('.photo-user-name h3');
    
        overlay.style.display = 'flex';
    
        let tempImg = null;
        let base64Image = null;
    
        // Ensure only one event listener exists
        fileInput.onchange = function () {
            const selectedFile = fileInput.files[0];
    
            addBtn.disabled = !selectedFile;
            imagepreview.style.display = selectedFile ? "block" : "none";
            imgSrc.src = selectedFile ? URL.createObjectURL(selectedFile) : "";
            tempImg = selectedFile ? URL.createObjectURL(selectedFile) : null;
            imageFile = selectedFile ? selectedFile : null;
    
            if (!selectedFile || !selectedFile.type.startsWith("image/")) {
                alert("Please select a valid image.");
                return;
            }
    
            // Convert image to Base64 string for persistent storage
            const reader = new FileReader();
            reader.onloadend = function () {
                base64Image = reader.result; // This is the Base64-encoded string
            };
            reader.readAsDataURL(selectedFile);
        };
    
        closeOverlay.onclick = function () {
            imagepreview.style.display = 'none';
            addBtn.disabled = true;
            // Before the file input is set to a new file or the overlay is closed
            URL.revokeObjectURL(tempImg);
    
            imgSrc.src = "";
            fileInput.value = "";
            overlay.style.display = 'none';
            photoName.textContent = userData.Name ? userData.Name : "John Doe";
            checkAllInputFilled();
        };
    
        addBtn.onclick = function () {
            photoHolder.src = URL.createObjectURL(fileInput.files[0]); // Show the temporary image preview
            firSectionEdited = true;
    
            // Save the Base64 image to userData
            userData["UserImage"] = base64Image ? base64Image : "No Image";
            sessionStorage.setItem('userData', JSON.stringify(userData));  // Save the Base64 string
    
            // Clean up
            URL.revokeObjectURL(tempImg);
            photoName.textContent = userData.Name ? userData.Name : "John Doe";
            imagepreview.style.display = 'none';
            addBtn.disabled = true;
            imgSrc.src = "";
            fileInput.value = "";
            overlay.style.display = 'none';
            checkAllInputFilled();
        };
    }
    
    CVBtn.onclick = function() {
        
        populateTemplates();
    }

    function  populateTemplates() {
        const  overlay = document.querySelector('.overlay-choice-templates');
        const exit = overlay.querySelector('.templates-choice-close');
        const container = overlay.querySelector('ul');

        overlay.style.display = 'flex';

        container.querySelectorAll('li').forEach((li,index) => {
            li.addEventListener('click', function () {
                if(index === 0) {
                    populatePlainTemplates();
                }
                else{
                    populateImg1Templates();
                }

                overlay.style.display = 'none';
            });
        });

        exit.onclick = () => {
            overlay.style.display = 'none';
        }
    }

    const renderDetail = (element) => {
        const className = element.className; // Get className of the span element
        if (userData && userData.hasOwnProperty(className)) {
            let content = userData[className];
        
            // Handle case when content is an array
            if (Array.isArray(content)) {
                content = content.map(item => item === 'none' ? 'Not available for the moment' : item);
            } else if (content === 'none') {
                content = 'Not available for the moment';
            }
    
            // Set the updated content
            element.textContent = Array.isArray(content) ? content.join(', ') : content;
        } else {
            
        }
    };
    
    // Function to populate the template with userData
    function populatePlainTemplates() {
        const firstTemplate = document.querySelectorAll('.overlay-templates .tepmlates')[0]; // Get the first template
        const allTempDivs = firstTemplate.querySelectorAll('div'); // Get all divs inside the template
        const downloadPDFBtnInFirstTemplate = firstTemplate.querySelectorAll('.button button')[0];
        const downloadTXTBtnInFirstTemplate = firstTemplate.querySelectorAll('.button button')[1];
        
        document.querySelectorAll('.overlay-templates .tepmlates').forEach(div => {
            if(div !== firstTemplate) {
                div.style.display = 'none';
            }
        })

        document.querySelector('.overlay-templates').style.display = "flex";

        // Iterate over each div in the template
        allTempDivs.forEach(div => {
            const allSpans = div.querySelectorAll('p span'); // Get all span elements within each div
            
            // Iterate over each span and render its corresponding detail from userData
            allSpans.forEach(spantag => {
                renderDetail(spantag); // Call renderDetail function to populate the span with data
            });
        });

        downloadPDFBtnInFirstTemplate.disabled =  isdownloadedCVPlainText;
        downloadTXTBtnInFirstTemplate.disabled = isdownloadedCVPlainTextTXT;

        downloadPDFBtnInFirstTemplate.onclick = function () {
            downLoadCv(firstTemplate, "PDF");
            downloadPDFBtnInFirstTemplate.disabled = true;
            sessionStorage.setItem("isTrueDownloaded", "true");
        }

        downloadTXTBtnInFirstTemplate.onclick = function () {
            downLoadCv(firstTemplate, "Text");
            downloadTXTBtnInFirstTemplate.disabled = true;
            isdownloadedCVPlainText = true;

            sessionStorage.setItem("isTruesDownloaded", "true")
        }

        downloadTXTBtnInFirstTemplate.disabled = isdownloadedCVPlainText;
    }

    document.querySelector('.overlay-templates .templates-close').onclick = function () {
        document.querySelectorAll('.overlay-templates .tepmlates').forEach(div => {
                div.style.display = 'block';
        });
        this.parentElement.style.display = 'none';
    }

    function  populateImg1Templates() {
        const secondTemplate = document.querySelectorAll('.overlay-templates .tepmlates')[1];
        const imgHolder = secondTemplate.querySelector('.image-cv .photo img');
        const templateDivs = secondTemplate.querySelectorAll('.template-content');
        const downloadCvAsPDFBtn = secondTemplate.querySelector('.button button');

        document.querySelectorAll('.overlay-templates .tepmlates').forEach(div => {
            if(div !== secondTemplate) {
                div.style.display = 'none';
            }
        });

        imgHolder.src = userData ? userData.UserImage : "logo.png";
        
        templateDivs.forEach(div => {
            const allSpans = div.querySelectorAll('p span'); // Get all span elements within each div
            
            // Iterate over each span and render its corresponding detail from userData
            allSpans.forEach(spantag => {
                renderDetail(spantag); // Call renderDetail function to populate the span with data
            });
        })

        document.querySelector('.overlay-templates').style.display = "flex";

        // Disable the button initially if already downloaded
        downloadCvAsPDFBtn.disabled = isdownloadedCVWithImage;

        downloadCvAsPDFBtn.onclick = () => {
            downloadCvAsPDFBtn.disabled = true;
            downLoadCvWithImage(secondTemplate);
            isdownloadedCVWithImage = true;

            sessionStorage.setItem("isDownloaded", "true");
        }

        
    }

    

    function downLoadCv(templateElement, format) {
        const clonedTemplate = templateElement.cloneNode(true);
    
        // Remove buttons from cloned template
        const buttons = clonedTemplate.querySelectorAll('.button');
        buttons.forEach(button => button.remove());
    
        if (format === "PDF") {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            let y = 26; // Initial Y position for text
    
            // Title - Curriculum Vitae
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text("Curriculum Vitae", 105, y, { align: "center" });
    
            const textWidth = doc.getTextWidth("Curriculum Vitae");
            doc.line(105 - textWidth / 2, y + 2, 105 + textWidth / 2, y + 2);
            y += 20; // Space below title
    
            // Extract text and format each section
            const sections = clonedTemplate.querySelectorAll('h2, p');
    
            sections.forEach(element => {
                if (element.tagName === "H2") {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(18);
                    y += 10;
                    doc.text(element.textContent.trim(), 20, y);
                    y += 8;
                } else if (element.tagName === "P") {
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(14);
    
                    let currentX = 20;
    
                    element.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            doc.setFont("helvetica", "normal");
                        } else if (node.tagName === "STRONG") {
                            doc.setFont("helvetica", "bold");
                        }
    
                        const lines = doc.splitTextToSize(node.textContent.trim(), 170);
                        lines.forEach(line => {
                            // Check if adding the line will overflow the page
                            if (y + 10 > doc.internal.pageSize.height) {
                                doc.addPage(); // Add new page
                                y = 20; // Reset Y position
                            }
                            doc.text(line, currentX, y);
                            y += 6;
                        });
    
                        doc.setFont("helvetica", "normal");
                    });
    
                    y += 6;
                }
            });
    
            const file = `${userData ? userData.Name : "New"}_CV.pdf`;
    
            setTimeout(() => {
                doc.save(file);
                showSuccessMessage("Your CV has been successfully downloaded as a PDF!");
            }, 100);  // Add a short delay (100ms)
    
        } else if (format === "Text") {
            const textContent = clonedTemplate.textContent.trim();
            const blob = new Blob([textContent], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${userData ? userData.Name : "New"}_CV.txt`;
            link.click();
            // Show success message
            showSuccessMessage("Your CV has been successfully downloaded as a text file!");
        }
    }
    
    
    
    // Helper function: Given an image URL, returns a Promise that resolves to a Base64 data URL
    function getBase64ImageFromURL(url) {
        return new Promise((resolve, reject) => {
        const img = new Image();
        // If your image is loaded from a different domain, you might need CORS support:
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = () => {
            // Create a canvas to draw the image onto
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            // Get the data URL
            const dataURL = canvas.toDataURL("image/png");
            resolve(dataURL);
        };
        img.onerror = (error) => {
            reject(error);
        };
        img.src = url;
        });
    }
    
    async function downLoadCvWithImage(template) {
        // Clone the template to avoid modifying the original
        const clonedTemplate = template.cloneNode(true);
    
        // Remove any elements with class "button" from the cloned template
        const buttons = clonedTemplate.querySelectorAll('.button');
        buttons.forEach(button => button.remove());
    
        // Locate the image element (adjust the selector as needed)
        const imageElement = clonedTemplate.querySelector('img');
        let imageData = null;
        if (imageElement) {
            const imageUrl = imageElement.src;
            try {
                imageData = await getBase64ImageFromURL(imageUrl);
            } catch (error) {
                console.error("Error converting image:", error);
            }
        }
    
        // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        let y = 10; // initial y position
    
        // If we have an image, add it at the top
        if (imageData) {
            // Example: add image at x=20, y=20, with width 50 and height 50.
            // Adjust dimensions as needed.
            doc.addImage(imageData, 'PNG', 20, y, 50, 50);
            y += 60; // Add extra vertical space after the image
        }
    
        // Add a title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        // Center the title on the page (assuming page width ~210mm for A4, adjust as needed)
        doc.text("Curriculum Vitae", 105, y, { align: "center" });
        const textWidth = doc.getTextWidth("Curriculum Vitae");
        // Draw a line under the title
        doc.line(105 - textWidth / 2, y + 2, 105 + textWidth / 2, y + 2);
        y += 20; // Adjust vertical spacing
    
        // Extract text sections (all <h2> and <p> elements)
        const sections = clonedTemplate.querySelectorAll('h2, p');
    
        // Function to check if there's enough space on the page
        const checkPageSpace = (doc, yPosition, requiredSpace = 10) => {
            const pageHeight = doc.internal.pageSize.height;
            if (yPosition + requiredSpace > pageHeight) {
                doc.addPage();  // Add a new page
                return 20;  // Reset y position for the new page (starting at the top)
            }
            return yPosition;
        };
    
        sections.forEach(element => {
            if (element.tagName === "H2") {
                // Check if there’s space for the header
                y = checkPageSpace(doc, y, 20);
    
                doc.setFont("helvetica", "bold");
                doc.setFontSize(18);
                y += 10;
                doc.text(element.textContent.trim(), 20, y);
                y += 8;
            } else if (element.tagName === "P") {
                // Check if there’s space for the paragraph
                y = checkPageSpace(doc, y, 20);
    
                doc.setFont("helvetica", "normal");
                doc.setFontSize(14);
                let currentX = 20;
                // Loop through child nodes to check for bold text (<strong>) and normal text
                element.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        doc.setFont("helvetica", "normal");
                    } else if (node.tagName === "STRONG") {
                        doc.setFont("helvetica", "bold");
                    }
                    // Split the text so it wraps within a given width (adjust 170 as needed)
                    const wrappedText = doc.splitTextToSize(node.textContent.trim(), 170);
                    wrappedText.forEach(line => {
                        y = checkPageSpace(doc, y, 6);  // Check space after each line
                        doc.text(line, currentX, y);
                        y += 6;
                    });
                    // Reset font to normal
                    doc.setFont("helvetica", "normal");
                });
                y += 6;
            }
        });
    
        // Save the generated PDF
        setTimeout(() => {
            doc.save(`${userData ? userData.Name : "New"}_CV.pdf`);
            showSuccessMessage("Your CV has been successfully downloaded as a PDF!");
        }, 100);  // Add a short delay (100ms)
    }
    
  
      
      
    function showSuccessMessage(message) {
        document.querySelector('.success-overlay').style.display = 'flex';
        document.querySelector('.success-overlay h2').textContent = message
        setTimeout(function () {
            document.querySelector('.success-overlay').style.display = 'none';
        },5000);
    }
    

    let isVerified = sessionStorage.getItem("verified") === "true"; // Ensure it’s a boolean
    let expiredInerval;
    let count = 7200;
    let alertShown = false; // To prevent showing the message repeatedly

    
    // If the user is already verified, hide the authentication overlay
    if (isVerified) {
        document.querySelector('.authentication-overlay').style.display = "none";
    } else {
        AuthenticateUser(); // Show the authentication overlay if not verified
    }

    async function AuthenticateUser() {
        const authOverlay = document.querySelector('.authentication-overlay');
        const inputField = authOverlay.querySelector('.authentication-content .pass-code-input input');
        const subBtn = authOverlay.querySelector('.authentication-content .pass-code-input button');
        const hint = authOverlay.querySelector('.authentication-content h4 #Hint');
        
        let allPasscodes = [];

        const romanNumbers = {
            1: "I", 2: "II", 3: "III", 4: "IV", 5: "V",
            6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X",
        };
        
        // Fetch passwords properly
        try {
            const response = await fetch('passcode.json');
            if (!response.ok) throw new Error("Failed to load data");

            allPasscodes = await response.json();
        } catch (err) {
            console.error("Failed", err);
            return; // Stop execution if fetch fails
        }

        if (allPasscodes.length > 0) {
            proceedToVerify();
        }

        function proceedToVerify() {
            const randomIndex = Math.floor(Math.random() * allPasscodes.length);
            const chosenPasscodeName = allPasscodes[randomIndex];
            let formatCase = null;
            if (chosenPasscodeName.PasswordUpperCase) {
                formatCase = "UpperCase";
            }
            if (chosenPasscodeName.PasswordLowerCase) {
                formatCase = "LowerCase";
            }
            
            const availablePasswords = chosenPasscodeName.PasswordList;
            const randomPasswordIndex = Math.floor(Math.random() * availablePasswords.length);
            const selectedPassword = availablePasswords[randomPasswordIndex];
            const index = availablePasswords.findIndex(pass => pass === selectedPassword);
            hint.textContent = `${chosenPasscodeName.PasswordName} - ${romanNumbers[index + 1]} (${formatCase})`;
            const formatedCase = (formatCase === "UpperCase") ? selectedPassword.toUpperCase() : selectedPassword.toLowerCase();
            const bestPasswordMatch = formatedCase;


            inputField.oninput = () => {
                subBtn.disabled = inputField.value.trim() === '';
            };

            subBtn.onclick = () => {
                if (inputField.value.trim() === bestPasswordMatch) {
                    authOverlay.style.display = "none";
                    isVerified = true;
                    sessionStorage.setItem("verified", "true"); // Store as string "true"
                    showSuccessMessage("Welcome This Session Expires in 2 Hours Already Five Seconds are over");
                    startCountDownSession();
                } else {
                    authOverlay.style.display = "flex";
                    isVerified = false;
                    sessionStorage.setItem("verified", "false");
                }
    
                subBtn.disabled = true;
                inputField.value = '';
            };
        }

        

        function startCountDownSession(){
            expiredInerval = setInterval(function(){
                count--;  // Decrease count by 1 every second
                if(count <= 5 && !alertShown) {
                    showSuccessMessage(`Your session expires in ${count} seconds`);
                    alertShown - true;
                }

                if(count === 0){
                    clearInterval(expiredInerval);  // Stop the countdown
                    sessionStorage.clear();  // Clear session storage
                    window.location.reload();  // Reload the page
                }
            }, 1000);  // Interval set to 1 second
        }

        
    }

  
    
    
   
})