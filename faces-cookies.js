function getCookie(name = 'faces_access_token') {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

getCookie();

function setCookie(value) {
    const name = 'faces_access_token';
    const date = new Date();
    date.setTime(date.getTime() + (1000 * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Usage
setCookie('your_token_value');
