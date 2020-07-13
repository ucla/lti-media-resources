const getLtikPromise = new Promise((resolve, reject) => {
  const searchParams = new URLSearchParams(window.location.search);
  let potentialLtik = searchParams.get('ltik');
  if (!potentialLtik) {
    potentialLtik = sessionStorage.getItem('ltik');
    if (!potentialLtik) reject(new Error('Missing lti key.'));
  }
  resolve(potentialLtik);
});

const ltikPromise = new Promise((resolve, reject) => {
  getLtikPromise
    .then(res => {
      sessionStorage.setItem('ltik', res);
      resolve(res);
    })
    .catch(err => {
      reject(err);
    });
});

export { ltikPromise };
