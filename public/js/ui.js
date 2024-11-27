// UI utility functions
const UI = {
    showMessage(message, type = 'info') {
        alert(message); // In production, replace with a proper notification system
    },

    formatDate(date) {
        return new Date(date).toLocaleDateString();
    },

    clearForm(formId) {
        document.getElementById(formId).reset();
    }
};

window.UI = UI;