const authConfig = window.HISABWIZ_SUPABASE_CONFIG || {};
const authSetupNotes = [
  document.getElementById('loginSetupNote'),
  document.getElementById('registerSetupNote'),
];
const authSubmitButtons = [...document.querySelectorAll('#loginForm .auth-submit, #registerForm .auth-submit')];
const accountButton = document.getElementById('accountButton');
const profileGuest = document.getElementById('profileGuest');
const profileAccount = document.getElementById('profileAccount');
const profileEmail = document.getElementById('profileEmail');
const profileDisplayName = document.getElementById('profileDisplayName');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const profileForm = document.getElementById('profileForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');
const profileMessage = document.getElementById('profileMessage');
const signOutButton = document.getElementById('signOutButton');
let supabase;
let currentUser = null;

function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('is-error', isError);
}

function setAuthSetupMessage(message) {
  authSetupNotes.forEach((note) => {
    note.textContent = message;
    note.hidden = false;
  });
}

function renderUser(user) {
  currentUser = user;
  accountButton.textContent = user ? 'Profile' : 'Sign in';
  accountButton.setAttribute('aria-label', user ? 'Open your profile' : 'Sign in');
  accountButton.dataset.viewLink = user ? 'profile' : 'login';
  profileGuest.hidden = Boolean(user);
  profileAccount.hidden = !user;

  if (user) {
    profileEmail.textContent = user.email || '';
    profileDisplayName.value = user.user_metadata?.display_name || '';
  }
}

async function loadProfile(user) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      showMessage(profileMessage, `Could not load your profile: ${error.message}`, true);
      return;
    }

    profileDisplayName.value = data?.display_name || user.user_metadata?.display_name || '';
    showMessage(profileMessage, '');
  } catch (error) {
    showMessage(profileMessage, `Could not load your profile: ${error.message}`, true);
  }
}

function usesServiceRoleKey(key) {
  if (/^(sb_secret_|service_role_)/i.test(key)) return true;
  const encodedPayload = key.split('.')[1];
  if (!encodedPayload) return false;
  try {
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')));
    return payload.role === 'service_role';
  } catch {
    return false;
  }
}

async function startAuth() {
  const url = typeof authConfig.url === 'string' ? authConfig.url.trim() : '';
  const anonKey = typeof authConfig.anonKey === 'string' ? authConfig.anonKey.trim() : '';
  if (!url || !anonKey) {
    setAuthSetupMessage('Account sign-in is optional and is not configured yet. To enable it, add your Supabase project URL and public anon/publishable key to supabase-config.js. All calculators work without an account.');
    return;
  }

  let projectUrl;
  try {
    projectUrl = new URL(url);
  } catch {
    setAuthSetupMessage('The Supabase project URL in supabase-config.js is not a valid URL. Calculators remain available without an account.');
    return;
  }

  const isLocalProject = ['localhost', '127.0.0.1'].includes(projectUrl.hostname);
  if (!['https:', ...(isLocalProject ? ['http:'] : [])].includes(projectUrl.protocol) ||
      usesServiceRoleKey(anonKey)) {
    setAuthSetupMessage('Use an HTTPS Supabase project URL (HTTP is allowed for localhost) and the public anon/publishable key only. Never put a service-role or secret key in this app. Calculators remain available without an account.');
    return;
  }

  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    supabase = createClient(projectUrl.href, anonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
  } catch (error) {
    setAuthSetupMessage(`The sign-in service could not be loaded. Check your internet connection and try again. Calculators remain available without an account. (${error.message})`);
    return;
  }

  authSetupNotes.forEach((note) => { note.hidden = true; });
  authSubmitButtons.forEach((button) => { button.disabled = false; });

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      setAuthSetupMessage(`Could not check the sign-in session: ${error.message}. Calculators remain available without an account.`);
      return;
    }
    renderUser(session?.user || null);
    if (session?.user) await loadProfile(session.user);
  } catch (error) {
    setAuthSetupMessage(`Could not check the sign-in session: ${error.message}. Calculators remain available without an account.`);
    return;
  }

  supabase.auth.onAuthStateChange((_event, updatedSession) => {
    const user = updatedSession?.user || null;
    renderUser(user);
    if (user) window.setTimeout(() => {
      if (currentUser?.id === user.id) loadProfile(user);
    }, 0);
    else showMessage(profileMessage, '');
  });
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabase) return;
  const submitButton = loginForm.querySelector('[type="submit"]');
  submitButton.disabled = true;
  showMessage(loginMessage, '');

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: document.getElementById('loginEmail').value.trim(),
      password: document.getElementById('loginPassword').value,
    });
    if (error) {
      showMessage(loginMessage, error.message, true);
      return;
    }
    loginForm.reset();
    navigate('profile');
  } catch (error) {
    showMessage(loginMessage, `Sign-in failed: ${error.message}`, true);
  } finally {
    submitButton.disabled = false;
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabase) return;

  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmation = document.getElementById('registerPasswordConfirm').value;
  if (password !== confirmation) {
    showMessage(registerMessage, 'The passwords do not match.', true);
    return;
  }

  const submitButton = registerForm.querySelector('[type="submit"]');
  submitButton.disabled = true;
  showMessage(registerMessage, '');
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    if (error) {
      showMessage(registerMessage, error.message, true);
      return;
    }
    registerForm.reset();
    if (data.session) {
      navigate('profile');
    } else {
      showMessage(registerMessage, 'Account created. Check your email for a confirmation link, then sign in.');
    }
  } catch (error) {
    showMessage(registerMessage, `Account creation failed: ${error.message}`, true);
  } finally {
    submitButton.disabled = false;
  }
});

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabase || !currentUser) return;

  const displayName = profileDisplayName.value.trim();
  if (!displayName) {
    showMessage(profileMessage, 'Enter a display name.', true);
    return;
  }

  const submitButton = profileForm.querySelector('[type="submit"]');
  submitButton.disabled = true;
  showMessage(profileMessage, '');
  try {
    const { error } = await supabase.from('profiles').upsert({
      id: currentUser.id,
      display_name: displayName,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      showMessage(profileMessage, `Could not save your profile: ${error.message}`, true);
      return;
    }
    showMessage(profileMessage, 'Profile saved.');
  } catch (error) {
    showMessage(profileMessage, `Could not save your profile: ${error.message}`, true);
  } finally {
    submitButton.disabled = false;
  }
});

signOutButton.addEventListener('click', async () => {
  if (!supabase) return;
  signOutButton.disabled = true;
  showMessage(profileMessage, '');
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showMessage(profileMessage, `Could not sign out: ${error.message}`, true);
      return;
    }
    navigate('home');
  } catch (error) {
    showMessage(profileMessage, `Could not sign out: ${error.message}`, true);
  } finally {
    signOutButton.disabled = false;
  }
});

startAuth();
