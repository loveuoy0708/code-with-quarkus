window.onload= function() {
    fetch('/profile/info')
        .then(res => res.json())
        .then(data => {
            document.getElementById('infoUsername').textContent
                = data.username; // DOM 조작방지
            document.getElementById('infoEmail').textContent
                = data.email;
            document.getElementById('infoPhone').textContent
                = data.phone;
            if (data.profileImage) { // null 체크
                document.getElementById('profileImg').src
                    = '/uploads/profile/' + data.profileImage;
            }
    });
}