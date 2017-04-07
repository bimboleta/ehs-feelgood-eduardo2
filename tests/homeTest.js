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
  "Consegue ver os contratos de um cliente": (browser) => {
    browser
      .url("http://localhost:3000/loginGerente")
      .waitForElementVisible("body", 100);
    browser.click("#clientes a:nth-of-type(1)").pause(1000);
    browser.expect.element("body").text.to.contain("Pintar parede");
    browser.expect.element("body").text.to.contain("Consertar piso");
    browser.end();
  },
  "Consegue ver os contratos de outro integrador": (browser) => {
    browser
      .url("http://localhost:3000/loginGerente")
      .waitForElementVisible("body", 100);
    browser.click("#integradores tr:nth-of-type(3) a:nth-of-type(1)").pause(1000);
    browser.expect.element("body").text.to.contain("Pintar parede");
    browser.end();
  },
  "Consegue ver os contratos de um integrador": (browser) => {
    browser
      .url("http://localhost:3000/loginGerente")
      .waitForElementVisible("body", 100);
    browser.click("#integradores a:nth-of-type(1)").pause(1000);
    browser.expect.element("body").text.to.contain("Consertar piso");
    browser.end();
  },
  "Consegue ver os contratos de serviço específico de um integrador": (browser) => {
    browser
      .url("http://localhost:3000/loginGerente")
      .waitForElementVisible("body", 100);
    browser.click("#integradores tr:nth-of-type(3) a:nth-of-type(2)").pause(1000);
    browser.expect.element("body").text.to.contain("Integrador");
    browser.expect.element("body").text.to.contain("Fornecedor");
    browser.end();
  },
  "Consegue ver os contratos de serviço específico de um fornecedor": (browser) => {
    browser
      .url("http://localhost:3000/loginGerente")
      .waitForElementVisible("body", 100);
    browser.click("#fornecedores tr:nth-of-type(3) a:nth-of-type(1)").pause(1000);
    browser.expect.element("body").text.to.contain("Integrador");
    browser.expect.element("body").text.to.contain("Fornecedor");
    browser.end();
  },
  "Consegue ver os contratos de serviço específico de outro fornecedor": (browser) => {
    browser
      .url("http://localhost:3000/loginGerente")
      .waitForElementVisible("body", 100);
    browser.click("#fornecedores tr:nth-of-type(2) a:nth-of-type(1)").pause(1000);
    browser.expect.element("body").text.to.contain("Integrador");
    browser.expect.element("body").text.to.contain("Fornecedor");
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
