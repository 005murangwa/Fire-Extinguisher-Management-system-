/**
 * Input props that block browser autofill on page load while still allowing
 * the user to pick a saved password/email from the browser UI after focus.
 */
export function noAutofillTextProps(name) {
  return {
    name,
    autoComplete: 'off',
    readOnly: true,
    onFocus: (e) => {
      e.target.removeAttribute('readonly');
    },
  };
}

export function noAutofillPasswordProps(name = 'password') {
  return {
    name,
    autoComplete: 'new-password',
    readOnly: true,
    onFocus: (e) => {
      e.target.removeAttribute('readonly');
    },
  };
}
