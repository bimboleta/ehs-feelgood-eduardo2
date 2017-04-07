module.exports = {
  "Verifica se não há tarifações para o gerente": function (browser) {
    browser
      .url("http://localhost:3000/tarifacao");
    browser.expect.element('body').text.to.not.contain('391.854.828-70');
    browser.end();
  },
  'Abre página principal': function (browser) {
    browser
      .url('http://localhost:3000')
      .waitForElementVisible('body', 100)
      .end();
  },
  "Não há informações se não estiver logado": (browser) => {
    browser
      .url("http://localhost:3000")
      .waitForElementVisible("body", 100);
    browser.expect.element("body").text.to.not.contain("Ver contratos");
    browser.end();
  },
  "Há informações depois de logado": (browser) => {
    browser
      .url("http://localhost:3000/loginGerente")
      .waitForElementVisible("body", 100);
    browser.expect.element("body").text.to.contain("Ver contratos");
    browser.end();
  },
  "Verifica se há tarifações para o gerente": function (browser) {
    browser
      .pause(15000)
      .url("http://localhost:3000/tarifacao")
    browser.expect.element('body').text.to.contain('391.854.828-70');
    browser.end();
  }
};
