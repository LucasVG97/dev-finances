// MODAL DE NOVA TRANSAÇÃO
const modal = {
  open() {
    //pesquisar pela classe .modal-overlay no documento inteiro
    //adicionar a classe active
    document
      .querySelector(".modal-overlay")
      .classList.add("active")
  },
  close() {
    //pesquisar pela classe .modal-overlay no documento inteiro
    //remover a classe active
    document
      .querySelector(".modal-overlay")
      .classList.remove("active")
  }
};


//adicionando ao local storage

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    // comando json q transforma em array
  },
  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) // comando json q transforma em string
  }
}

// ENTRADAS, SAÍDAS E TOTAL

const Transaction = {

  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)
    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)
    App.reload()
  },

  incomes() {
    let income = 0;
    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });
    return income;
  },

  expenses() {
    let expense = 0;
    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });
    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  }
}

// cria o elemento html e retorna para o elemento tr criado

const inner = {
  //utilizado para servir de corpo da tabela
  transactionsContainer: document.querySelector("#data-table tbody"),

  //index é a posição do array onde estará guardado o objeto
  addTransaction(transaction, index) {
    const tr = document.createElement("tr")
    tr.innerHTML = inner.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index
    inner.transactionsContainer.appendChild(tr) //utilizado para colocar o child tr dentro do transactionsContainer
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense"
    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
              <img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="Remover transação">
            </td>
    `

    return html
  },

  //Atualizar os valores de entrada, saída e total
  updateBalance() {
    document
      .getElementById("incomeDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document
      .getElementById("expenseDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document
      .getElementById("totalDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.total())
  },

  //para não repetir as transações ja registradas em tabela durante o reload
  clearTransactions() {
    inner.transactionsContainer.innerHTML = ""
  }
}

//Coisas úteis para as funções

// na expressão /\D/g temos algo definido como expressão regular, no caso: / / as duas barras com conteudo dentro definem a espressão regular. A expressão \D significa achar tudo que não é número e o g esta se relacionando ao caráter global.

//o objetivo da função a baixo é de formatar os números, onde signal serve para definir o sinal do valor, após isso transformamos em string para tiraemos todos os possíveis caracteres não números da entrada, com a função replace. Após isso transformamos em número novamente e colocamos a formatação decimal, por final adicionamos o cifrão

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100
    return value

  },

  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },


  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""
    value = String(value).replace(/\D/g, "")
    value = Number(value) / 100
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value
  }
}

//verificar se as uinformações foram preenchidas, formatar dados para salvar, salvar, apagar os dados no formulário, fechar modal, atualizar aplicação 

const Form = {

  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues()
    //verificando se os valores não estão vazios, com o trim e retornando mensagem de erro com o throw 
    if (description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === "") {
      throw new Error("Preencha todos os campos")
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validateFields()
      const transaction = Form.formatValues()
      Transaction.add(transaction)
      Form.clearFields()
      modal.close()
    }

    catch (error) {
      alert(error.message)
    }




  }

}

//adiciona transações e atualiza o balanço

const App = {
  init() {
    //adicionar as transações na tabela
    Transaction.all.forEach(inner.addTransaction)

    inner.updateBalance()

    Storage.set(Transaction.all)
  },

  reload() {
    inner.clearTransactions()
    App.init()
  }
}

App.init()
