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

const getLtik = () => {
  const searchParams = new URLSearchParams(window.location.search);
  let ltik = searchParams.get('ltik');
  if (!ltik) {
    ltik = sessionStorage.getItem('ltik');
    if (!ltik) throw new Error('Missing lti key.');
  }
  sessionStorage.setItem('ltik', ltik);
  return ltik;
};

export { ltikPromise, getLtik };
