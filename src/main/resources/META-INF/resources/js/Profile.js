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
 
// 회원정보읽고, json형태변환후화면갱신(비동기처리)
fetch('/profile/info')
    .then(res => res.json())
    .then(data => {
// 기존정보테이블표시(유지)
        document.getElementById('infoUsername').textContent= data.username;
        document.getElementById('infoEmail').textContent = data.email;
        document.getElementById('infoPhone').textContent = data.phone;
        if (data.profileImage) {
            document.getElementById('profileImg').src=
                '/uploads/profile/' + data.profileImage;
        }

// 수정폼에기존값자동채우기
        document.getElementById('updateEmail').value = data.email;
        document.getElementById('updatePhone').value = data.phone;
// Tooltip 으로사용자명표시(navUsernamespan 방식→ 교체)
        const profileLink= document.getElementById('profileNavLink');
        if (profileLink) {
            profileLink.setAttribute('data-bs-title', ' ' + data.username);
            new bootstrap.Tooltip(profileLink);
        }
    });

       // URL 파라미터오류감지
const params = new URLSearchParams(window.location.search);
const error = params.get('error');
const success = params.get('success');

const msgEl= document.getElementById('updateMsg');

if (success === 'updated') {
    msgEl.className= 'alert alert-success';
    msgEl.textContent= '개인정보가 수정되었습니다.';
} else if (error === 'duplicate_email') {
    msgEl.className= 'alert alert-danger';
    msgEl.textContent= '이미 사용중인 이메일입니다.';
}

if (error === 'wrong_password') {
// ①Toast 먼저(즉각알림)
    showToast('현재비밀번호가일치하지않습니다.', 'danger');
    const pwMsgEl= document.getElementById('pwMsg');
    if (pwMsgEl) {
        pwMsgEl.className = 'alert alert-danger';
        pwMsgEl.textContent= '현재 비밀번호가 일치하지 않습니다.';
    }
}

if (error) {
    const messages = {
        'invalid_type': 'jpg, png, gif, webp파일만 가능합니다.',
        'too_large': '파일크기는5MB 이하여야합니다.',
        'upload_fail': '업로드실패. 다시 시도해주세요.'
    };
    const msg = messages[error];
    const div = document.getElementById('uploadErrorMsg');
    if (msg && div) {
        div.textContent= msg;
        div.classList.remove('d-none');
    }
}
// 비밀번호변경성공처리, window.onload안에삽입
if (success === 'password_changed') {
// Toast 출력
    showToast(
        '비밀번호 변경완료, 로그인 페이지로 이동합니다.',
        'success'
    );
// 3.5초후로그인페이지로이동
    setTimeout(function() {
        window.location.href= '/logout?next=login';
    }, 3500);
}
}

function validateAndUpdate() {
    let valid = true;

    const email = document.getElementById('updateEmail').value.trim();
    const phone = document.getElementById('updatePhone').value.trim();
// ①이메일형식검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFieldError('updateEmail', 'updateEmailMsg',
            '올바른 이메일 형식이 아닙니다.');
        valid = false;
    } else {
        clearFieldError('updateEmail');
}    

// ②연락처형식검사
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
        showFieldError('updatePhone', 'updatePhoneMsg',
            '010-0000-0000 형식으로 입력해주세요.');
        valid = false;
    } else {
        clearFieldError('updatePhone');
    }

    if (valid) document.getElementById('updateForm').submit();
}

// profile.js 전용showError / clearError
function showFieldError(fieldId, msgId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add('is-invalid');
    const msg = document.getElementById(msgId);
    if (msg) msg.textContent = message;
}
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
}

async function validateAndChangePassword() {
    let valid = true;

    const currentPw= document.getElementById('currentPwInput').value;
    const newPw = document.getElementById('newPwInput').value;
    const newPwConfirm= document.getElementById('newPwConfirm').value;
// ①현재비밀번호빈값체크
    if (!currentPw) {
        showFieldError('currentPwInput', 'currentPwMsg',
            '현재 비밀번호를 입력해 주세요.');
        valid = false;
    } else {
        clearFieldError('currentPwInput');
    }

// ②새비밀번호정규식검사
    const pwRegex= /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!pwRegex.test(newPw)) {
        showFieldError('newPwInput', 'newPwMsg',
            '8자이상, 영문+숫자+특수문자를 포함해야 합니다.');
        valid = false;}
    else {
        clearFieldError('newPwInput');
    }
// ③새비밀번호확인일치
    if (newPw!== newPwConfirm) {
        showFieldError('newPwConfirm', 'newPwConfirmMsg',
            '새 비밀번호가 일치하지 않습니다.');
        valid = false;
    } else {
        clearFieldError('newPwConfirm');
    }

    if (!valid) return;
// ④ 현재/새 비밀번호 SHA-256 해시 생성
    const hashedCurrent = await hashPassword(currentPw);
    const hashedNew = await hashPassword(newPw);

    document.getElementById('currentPassword').value = hashedCurrent;
    document.getElementById('newPassword').value    = hashedNew;
// F12 콘솔 확인
    console.log('현재 PW 해시 :', hashedCurrent);
    console.log('새 PW 해시 :', hashedNew);

    document.getElementById('pwForm').submit();
}
