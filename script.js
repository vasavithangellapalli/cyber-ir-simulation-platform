function showScreen(screenId) {
            // Hide all screens
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected screen
            document.getElementById(screenId).classList.add('active');
            
            // Add active class to clicked tab
            event.target.classList.add('active');
        }
