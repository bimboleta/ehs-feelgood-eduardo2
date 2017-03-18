module.exports = {
  "Verifica se não há tarifações para o cliente, integrador e fornecedor": function(browser){
    browser
      .url("http://localhost:3000/tarifacao");
    browser.expect.element('body').text.to.not.contain('391.854.828-70');
    browser.expect.element('body').text.to.not.contain('02.032.012/060-12');
    browser.expect.element('body').text.to.not.contain('02.032.012/060-13');
    browser.end();
  },
  'Abre página principal': function (browser) {
    browser
      .url('http://localhost:3000')
      .waitForElementVisible('body', 100)
      .end();
  },
  "Adiciona, deleta e adiciona servico": function (browser) {
    browser
      .url("http://localhost:3000/loginIntegrador")
      .setValue("input[name=serviceName]", "Serviço de parede")
      .setValue("input[name=serviceDescription]", "Arruma furos e infiltrações")
      .click("form button")
      .pause(100)
      .assert.containsText("body", "parede")
      .click("a.btn.btn-danger")
      .pause(100);
    browser.expect.element('body').text.to.not.contain('parede');
    browser
      .setValue("input[name=serviceName]", "Serviço de parede")
      .setValue("input[name=serviceDescription]", "Arruma furos e infiltrações")
      .click("form button")
      .pause(100)
      .assert.containsText("body", "parede")
    browser.end();
  },
  "Cliente contrata serviço": function (browser) {
    browser
      .url("http://localhost:3000/loginCliente")
      .setValue("input[name=serviceName]", "parede")
      .click("form button")
      .pause(100)
      .assert.containsText("body", "parede")
      .click("a.negociar")
      .pause(200)
      .click("a.contratosTab")
      .pause(200)
      .assert.containsText("body", "parede")
    browser.end();
  },
  "Integrador modifica cronograma e gastos": function(browser){
    browser
      .url("http://localhost:3000/loginIntegrador")
      .click("a.contratosTab")
      .pause(200)
      .click("a.cronograma")
      .pause(200)
      .setValue("input[name=estado]", "Consertar infiltracoes e pintar")
      .click("button.adicionar-estado")
      .pause(200)
      .setValue("input[name=name]", "Tinta")
      .setValue("input[name=value]", "R$ 400,00")
      .click("button.adicionar-gasto")
      .pause(200)
      .assert.containsText("body", "Consertar")
      .assert.containsText("body", "Tinta")
      .end();
  },
  "Cliente ve cronograma e gastos": function(browser){
    browser
      .url("http://localhost:3000/loginCliente")
      .click("a.contratosTab")
      .pause(200)
      .click("a.cronograma")
      .pause(200)
      .assert.containsText("body", "Consertar")
      .assert.containsText("body", "Tinta")
      .end();
  },
  // Integrador - fornecedor
  "Adiciona, deleta e adiciona servico específico": function (browser) {
    browser
      .url("http://localhost:3000/loginFornecedor")
      .setValue("input[name=serviceName]", "Serviço de pintura")
      .setValue("input[name=serviceDescription]", "Pinto com as cores branca, azul e vermelha")
      .click("form button")
      .pause(100)
      .assert.containsText("body", "pintura")
      .click("a.btn.btn-danger")
      .pause(100);
    browser.expect.element('body').text.to.not.contain('pintura');
    browser
      .setValue("input[name=serviceName]", "Serviço de pintura")
      .setValue("input[name=serviceDescription]", "Pinto com as cores branca, azul e vermelha")
      .click("form button")
      .pause(100)
      .assert.containsText("body", "pintura")
    browser.end();
  },
  "Integrador contrata serviço específico": function (browser) {
    browser
      .url("http://localhost:3000/loginIntegrador")
      .url("http://localhost:3000/integrador/servicos-especificos")
      .setValue("input[name=serviceName]", "Serviço de pintura")
      .click("form button")
      .pause(100)
      .assert.containsText("body", "pintura")
      .click("a.negociar")
      .pause(200)
      .click("a.contratosTab")
      .pause(200)
      .assert.containsText("body", "pintura")
    browser.end();
  },
  "Fornecedor modifica cronograma e gastos": function(browser){
    browser
      .url("http://localhost:3000/loginFornecedor")
      .click("a.contratosTab")
      .pause(200)
      .click("a.cronograma")
      .pause(200)
      .setValue("input[name=estado]", "Iniciar pintura")
      .click("button.adicionar-estado")
      .pause(200)
      .setValue("input[name=name]", "Tinta")
      .setValue("input[name=value]", "R$ 300,00")
      .click("button.adicionar-gasto")
      .pause(200)
      .assert.containsText("body", "Iniciar pintura")
      .assert.containsText("body", "Tinta")
      .end();
  },
  "Integrador ve cronograma e gastos": function(browser){
    browser
      .url("http://localhost:3000/loginIntegrador")
      .url("http://localhost:3000/integrador/servicos-especificos")
      .click("a.contratosTab")
      .pause(200)
      .click("a.cronograma")
      .pause(200)
      .assert.containsText("body", "Iniciar pintura")
      .assert.containsText("body", "Tinta")
      .end();
  },
  "Verifica se há tarifações para o cliente, integrador e fornecedor": function(browser){
    browser
      .pause(15000)
      .url("http://localhost:3000/tarifacao")
    browser.expect.element('body').text.to.contain('391.854.828-70');
    browser.expect.element('body').text.to.contain('02.032.012/060-12');
    browser.expect.element('body').text.to.contain('02.032.012/060-13');
    browser.end();
  }
};
