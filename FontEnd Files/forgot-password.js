function redirectToForgotPasswordPage() {
    windows.location.href = 'forgot-password.html';
}
//function to display the message
function showMessage(msgText, className) {
    return new Promise(resolve => {
        const msg = document.getElementById('message');
        const div = document.createElement('div');
        const textNode = document.createTextNode(msgText);
        div.appendChild(textNode);
        msg.appendChild(div);
        msg.classList.add(className);

        setTimeout(() => {
            msg.classList.remove(className);
            msg.removeChild(div);
            resolve();
        }, 2000);
    })
}

async function submitData(event) {
    event.preventDefault();
    console.log('inside submitData forgot password');
    const token = localStorage.getItem('token');
    console.log('token:' + token);

    if (!token) {
        await showMessage('Authentication failed. Please log in again.', 'failureMessage');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 3000)
        return;
    }

    // Get values from the form
    const email = document.getElementById('inputEmail').value;
    console.log('email = ' + email);
    const obj = {
        email: email,
    }
    try {
        // and null is used as the second parameter since you are making a POST request without a request body.
        const response = await axios.post(`http://localhost:3000/password/forgotpassword/`, obj, {
            headers: {
                "Authorization": token
            }
        });
        console.log('response data = ' + JSON.stringify(response.data));
        //this will give the data inside the array
        const dataUser = response.data.userData;
        console.log('email = ' + dataUser.email);
        console.log('password = ' + dataUser.password);

        await showMessage(response.data.message, 'succesMessage');

        window.location.href = "/login.html";
    }
    catch (error) {
        console.log('Error object:', error);
        // await showMessage(error.response.data.message, 'failureMessage');
    }

}//submitData

