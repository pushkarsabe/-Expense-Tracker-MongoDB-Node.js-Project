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
    // Get values from the form
    const name = document.getElementById('inputName').value;
    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;

    console.log('name = ' + name);
    console.log('email = ' + email);
    console.log('password = ' + password);
    const obj = {
        name: name,
        email: email,
        password: password
    }
    try {
        const response = await axios.post('http://localhost:3000/user/signup', obj);

        console.log('data added');
        console.log('response data = ' + JSON.stringify(response));
        console.log('response name = ' + response.data.newUserDetails.name);
        console.log('response email = ' + response.data.newUserDetails.email);
        console.log('response password = ' + response.data.newUserDetails.password);

        showMessage('User Successfully Added', 'succesMessage');
        document.getElementById('inputName').value = "";
        document.getElementById('inputEmail').value = "";
        document.getElementById('inputPassword').value = "";

    } catch (error) {

        if (error.response.status === 401) {
            console.log('Error object:', error.response.data.meassage);
            showMessage('Email already exists', 'failureMessage');
        }
        else if (error.response.status === 400) {
            console.log('Error object:', error.response.data.error);
            showMessage('Input fields are empty', 'failureMessage');
        } else {
            console.log('Unhandled error:', error);
        }
    }

}//submitData
