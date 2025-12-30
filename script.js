// 菜单弹窗控制
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuClose = document.getElementById('menu-close');
    
    if (menuToggle && menuOverlay) {
        menuToggle.addEventListener('click', function() {
            menuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (menuClose && menuOverlay) {
        menuClose.addEventListener('click', function() {
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    if (menuOverlay) {
        menuOverlay.addEventListener('click', function(e) {
            if (e.target === menuOverlay) {
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // 邮箱表单提交
    const emailForm = document.getElementById('email-form');
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('contact-email').value;
            if (email) {
                // 创建mailto链接
                const mailtoLink = `mailto:hou.guan.yu@hotmail.com?subject=Contact from Website&body=Email: ${encodeURIComponent(email)}`;
                window.location.href = mailtoLink;
            }
        });
    }
});