// const API_URL = '/example.json?domain=';
const API_URL = 'https://apis.is/isnic?domain=';
const domains = document.querySelector('.domains');


/**
 * Leit að lénum á Íslandi gegnum apis.is
 */
const program = (() => {
  const result = domains.querySelector('.results');
  let img;

  // Fall sem fjarlægir síðustu skilaboð/niðurstöðu
  function removePrevResult() {
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }
  }

  // Fall sem birtir villuskilaboð
  function displayError(error) {
    removePrevResult();
    result.appendChild(document.createTextNode(error));
  }

  // Fall sem teiknar loading myndina ásamt texta
  function loading() {
    removePrevResult();
    const div = document.createElement('div');
    div.classList.add('loading');
    div.appendChild(img);
    div.appendChild(document.createTextNode('Leita að léni...'));
    result.appendChild(div);
  }

  // Fall sem bætir hverju staki í result listanum af síðunni í element sem er birt
  function addToList(dl, title, data) {
    if (data) {
      const dataElement = document.createElement('dt');
      dataElement.appendChild(document.createTextNode(title));
      const dataElementValue = document.createElement('dd');
      dataElementValue.appendChild(document.createTextNode(data));
      dl.appendChild(dataElement);
      dl.appendChild(dataElementValue);
    }
  }

  // Breyti dagsetningunni á ISO 8601 form
  function formatDate(date) {
    const d = date.toISOString().split('T')[0];
    return d;
  }

  // Fall sem birtir gögnin af síðunni
  function displayDomain(domainResult) {
    if (domainResult.length === 0) {
      displayError('Lén er ekki skráð');
      return;
    }

    const [{
      domain, registered, lastChange, expires,
      registrantname, email, address, country,
    }] = domainResult;

    const dl = document.createElement('dl');

    addToList(dl, 'Lén', domain);
    addToList(dl, 'Skráð', formatDate(new Date(registered)));
    addToList(dl, 'Síðast breytt', formatDate(new Date(lastChange)));
    addToList(dl, 'Rennur út', formatDate(new Date(expires)));
    addToList(dl, 'Skráningaraðili', registrantname);
    addToList(dl, 'Netfang', email);
    addToList(dl, 'Heimilisfang', address);
    addToList(dl, 'Land', country);

    removePrevResult();
    result.appendChild(dl);
  }

  // Fall sem meðhöndlar strenginn sem skrifaður var inn í input reitinn.
  function checkURL(url) {
    loading();
    // Sæki gögnin
    // eslint-disable-next-line no-undef
    fetch(`${API_URL}${url}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Villa kom upp');
      })
      .then((data) => {
        displayDomain(data.results);
      })
      .catch(() => {
        displayError('Villa við að sækja gögn');
      });
  }
  // Fall sem kallað er á þegar ýtt er á "leita".
  function search(e) {
    e.preventDefault();

    const input = domains.querySelector('input').value;

    // athuga hvort input sé tómur strengur
    if (input.trim() === '') {
      displayError('Lén verður að vera strengur');
    } else {
      checkURL(input);
    }
  }

  function init(_domain) {
    _domain.addEventListener('submit', search);

    img = document.createElement('IMG');
    img.src = 'loading.gif';
  }

  return {
    init,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  program.init(domains);
});
