async function getTokenValidation() {

    const token = document.getElementById("token").value;
    const responseElement = document.getElementById("response");

    try {
        const response = await fetch('https://id.twitch.tv/oauth2/validate', {
            method: 'GET',
            headers: { 'Authorization': 'OAuth ' + token }
        });

        const data = await response.json();
        responseElement.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        responseElement.textContent = 'Error: ' + error.message;
    }
    responseElement.style.display = 'block';
}