document.addEventListener("DOMContentLoaded", function() {
    const encryptButton = document.querySelector(".encrypt");
    const decryptButton = document.querySelector(".decrypt");
    const copyButton = document.querySelector(".copy");
    const textarea = document.querySelector("textarea");
    const outputParagraph = document.querySelector(".output p");
    const outputSpan = document.querySelector(".output span");
    const itemsPerPage = 5; // Número de elementos por página
    let currentPage = 1;

    // Función para encriptar texto
    function encryptText(text) {
        return CryptoJS.AES.encrypt(text, 'secret-key').toString();
    }

    // Función para desencriptar texto
    function decryptText(encryptedText) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedText, 'secret-key');
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            return null; // Retorna null si hay un error de desencriptación
        }
    }

    // Función para truncar texto
    function truncateText(text, charLimit = 20) {
        if (text.length > charLimit) {
            return text.slice(0, charLimit) + '...';
        }
        return text;
    }

    // Función para manejar la encriptación y actualización del contenido
    function handleEncryption() {
        const plainText = textarea.value.trim();
        if (plainText) {
            const encryptedText = encryptText(plainText);

            // Mostrar solo las primeras 50 caracteres y luego "..."
            const visiblePlainText = truncateText(plainText);
            const visibleEncryptedText = truncateText(encryptedText);

            // Actualizar el contenido de la columna
            outputParagraph.textContent = visibleEncryptedText;
            outputSpan.textContent = 'Texto plano: ' + visiblePlainText;

            // Establecer el texto completo en el botón de copiar
            copyButton.setAttribute('data-full-text', encryptedText);

            // Habilitar el botón de copiar
            copyButton.style.display = 'inline-block';

            // Guardar en localStorage
            saveToLocalStorage(plainText, encryptedText);
        } else {
            showNotification("Por favor, ingrese algún texto para encriptar.");
        }
    }

    // Función para manejar la desencriptación y actualización del contenido
    function handleDecryption() {
        const encryptedText = textarea.value.trim();
        if (encryptedText) {
            const decryptedText = decryptText(encryptedText);
            if (decryptedText) {
                // Mostrar solo las primeras 50 caracteres y luego "..."
                const visibleDecryptedText = truncateText(decryptedText);

                // Actualizar el contenido de la columna
                outputParagraph.textContent = visibleDecryptedText;
                outputSpan.textContent = 'Texto encriptado: ' + truncateText(encryptedText);

                // Establecer el texto completo en el botón de copiar
                copyButton.setAttribute('data-full-text', decryptedText);

                // Habilitar el botón de copiar
                copyButton.style.display = 'inline-block';
            } else {
                showNotification("El texto encriptado es inválido.");
            }
        } else {
            showNotification("Por favor, ingrese un texto encriptado para desencriptar.");
        }
    }

    // Función para guardar en localStorage
    function saveToLocalStorage(plainText, encryptedText) {
        let historyData = JSON.parse(localStorage.getItem('historyData')) || [];
        historyData.push({ plainText, encryptedText });
        localStorage.setItem('historyData', JSON.stringify(historyData));
    }

    // Función para copiar el texto al portapapeles
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification("Texto copiado al portapapeles.");
        });
    }

    // Función para copiar el texto completo desde el botón
    function copyFromButton() {
        const fullText = copyButton.getAttribute('data-full-text');
        copyToClipboard(fullText);
    }

    // Función para mostrar notificaciones personalizadas
    function showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000); // Mostrar notificación por 3 segundos
    }

    // Eventos
    encryptButton.addEventListener("click", handleEncryption);

    decryptButton.addEventListener("click", handleDecryption);

    copyButton.addEventListener("click", copyFromButton);

    // Función para renderizar el historial
    function renderHistory(page) {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';

        const historyData = JSON.parse(localStorage.getItem('historyData')) || [];
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = historyData.slice(startIndex, endIndex);

        paginatedItems.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            const visiblePlainText = truncateText(item.plainText);
            const visibleEncryptedText = truncateText(item.encryptedText);
            historyItem.innerHTML = `
                <p>Texto plano: ${visiblePlainText}</p>
                <button class="copy-button" data-text="${item.plainText}">Copiar</button>
                <p>Texto encriptado: ${visibleEncryptedText}</p>
                <button class="copy-button" data-text="${item.encryptedText}">Copiar</button>
            `;
            historyList.appendChild(historyItem);
        });

        // Reasignar evento de copiar para los botones en el modal
        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const text = event.target.getAttribute('data-text');
                copyToClipboard(text);
            });
        });
    }

    // Manejo de la paginación
    document.querySelector('.prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderHistory(currentPage);
        }
    });

    document.querySelector('.next-page').addEventListener('click', () => {
        const totalPages = Math.ceil((JSON.parse(localStorage.getItem('historyData')) || []).length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderHistory(currentPage);
        }
    });

    // Controlar la apertura y cierre del modal
    const modal = document.getElementById("history-modal");
    const viewHistoryBtn = document.querySelector(".view-history");
    const closeBtn = document.querySelector(".close-btn");

    viewHistoryBtn.addEventListener("click", () => {
        modal.classList.add("open");
        renderHistory(currentPage); // Renderiza la primera página al abrir el modal
    });

    closeBtn.addEventListener("click", () => {
        modal.classList.remove("open");
    });

    // Cerrar el modal si se hace clic fuera del contenido
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.remove("open");
        }
    });
});