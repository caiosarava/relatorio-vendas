## 2025-05-14 - Label-Input Association for Accessibility

**Learning:** Associating `<label>` elements with their corresponding inputs using `for` and `id` is a simple yet high-impact accessibility win. It not only helps screen readers but also improves usability for all users by increasing the clickable area to focus an input.

**Action:** Always ensure every form input has a unique `id` and a matching `<label for="...">`.

## 2025-05-14 - Explicit Edit State in Forms

**Learning:** When a form is used for both creating and editing, users can easily get confused about which mode they are in. Adding a clear title change (e.g., "Editar Venda" vs "Adicionar Nova Venda") and a "Cancel" button provides necessary feedback and control.

**Action:** Implement explicit "Edit Mode" UI changes, including a way to return to "Create Mode" without a page refresh.

## 2025-05-14 - Password Recovery Flow

**Learning:** Adding a password recovery option directly on the login screen reduces friction for users who have lost access. Providing clear feedback (success/error) and a way to navigate back to the login form is essential for a smooth experience.

**Action:** Always include a "Forgot Password" link on login forms and ensure the recovery flow is consistent with the rest of the app's design.

## 2025-05-14 - PWA and Instant Feedback (Toasts)

**Learning:** Transforming a web app into a PWA significantly improves the "native" feel and allows for offline capabilities, which is critical for business tools. Replacing blocking `alert()` calls with Toasts improves the flow of interaction and perceived performance.

**Action:** Implement PWAs for all management-focused applications. Use non-blocking Toast notifications for common actions (save, delete, error).
