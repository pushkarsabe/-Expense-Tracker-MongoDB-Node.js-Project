function redirectToForgotPasswordPage() {
    window.location.href = 'forgot-password.html';
}
//function to display the message
function showMessage(msgText, className) {
    const msg = document.getElementById('message');
    const div = document.createElement('div');
    const textNode = document.createTextNode(msgText);
    div.appendChild(textNode);
    msg.appendChild(div);
    msg.classList.add(className);

    setTimeout(() => {
        msg.classList.remove(className);
        msg.removeChild(div);
    }, 2000);
}

async function submitData(event) {
    event.preventDefault();
    console.log('inside submitData login');
    // Get values from the form
    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;

    console.log('email = ' + email);
    console.log('password = ' + password);

    const obj = {
        email: email,
        password: password
    }

    try {   
        const response = await axios.post(`http://localhost:3000/user/login`, obj);
        console.log('response data = ' + JSON.stringify(response.data));
        //this will give the data inside the array
        const dataUser = response.data.userDetails;
        console.log('email = ' + dataUser.email);
        console.log('token = ' + response.data.token);

        localStorage.setItem('token', response.data.token);

        showMessage('Email and Password verified', 'succesMessage');
        // alert('Logged in successfully');
        document.getElementById('inputEmail').value = '';
        document.getElementById('inputPassword').value = '';

        setTimeout(() => {
            window.location.href = 'addExpense.html';
        }, 2000)
    }
    catch (error) {
        //to handle the output response errors
        if (error.response.status === 400) {
            console.log('Error object:', error.response.data.message);
            showMessage('Input fields required', 'failureMessage');
        }
        else if (error.response.status === 401) {
            console.log('Error object:', error.response.data.message);
            showMessage('Email not found', 'failureMessage');
        }
        else if (error.response.status === 402) {
            console.log('Error object:', error.response.data.message);
            showMessage('Password does not match', 'failureMessage');
        }
        else {
            console.log('Unhandled error:', error);
        }
    }
}//submitData
