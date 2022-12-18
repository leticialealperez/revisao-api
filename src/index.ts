import express, { Request, Response } from 'express';
import cors from 'cors'
import { v4 as uuid } from 'uuid';

import 'dotenv/config';



const porta = process.env.PORT;
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  //Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
  res.header('Access-Control-Allow-Origin', '*');
  //Quais são os métodos que a conexão pode realizar na API
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  app.use(cors());
  next();
});

app.listen(porta, () => {
    console.log(`Servidor inicializado na porta ${porta}`);
});

interface Recado {
  id: string;
  description: string;
  detail: string;
}

interface User {
  name: string;
  email: string;
  password: string;
  recados: Recado[];
}

const users: User[] = [
  {
    email: 'teste@teste.com',
    name: 'João da Silva',
    password: 'senha123',
    recados: [],
  },
  {
    email: 'teste2@teste.com',
    name: 'Maria da Silva',
    password: 'senha12345',
    recados: [],
  },
];


// GET -> listagem -> solicitação de listagem todos os registros ou de um determinado registro -> READ
// POST -> solicitação de criação de um determinado novo registro -> CREATE
// PUT -> update -> solicitação de atualização de um determinado registro
// DELETE -> delete -> solicitação de exclusão de um determinado registro

// solicitacoes -> request
// respostas -> response

// --------------- USUARIOS ----------------------------------------------
// LISTAR TODOS OS USUÁRIOS DA APLICAÇÃO
app.get('/users', (request: Request, response: Response) => {

    if(users.length > 0) {
        return response.status(200).json({
          ok: true,
          message: 'Dados encontrados com sucesso',
          dados: users,
        });
    }
    
    return response.status(404).json({
      ok: false,
      message: 'Nenhum usuário cadastrado ainda',
      dados: users,
    });
})

// LISTAR UM USUARIO POR EMAIL OU IDENTIFICADOR
app.get('/users/:email', (request: Request, response: Response) => {
    const { email } = request.params;

    const userFound = users.find((user) => user.email === email);

    if(!userFound) {
        return response.status(404).json({
          ok: false,
          message: 'Nenhum usuário encontrado com esse e-mail',
          dados: {},
        });
    }

    return response.status(200).json({
      ok: true,
      message: 'Usuário encontrado com sucesso!',
      dados: userFound,
    });
})

// CRIAR UM NOVO USUARIO
app.post('/users', (request: Request, response: Response) => {
    const { name, email, password, recados } = request.body;

    if(!name) {
        return response.status(400).json({
          ok: false,
          message: 'Campo "Nome" é obrigatório.',
        });
    }

    if(!email) {
        return response.status(400).json({
          ok: false,
          message: 'Campo "E-mail" é obrigatório.',
        })
    }

    if (!password) {
        return response.status(400).json({
          ok: false,
          message: 'Campo "Senha" é obrigatório.',
        })
    }

    if (!recados) {
      return response.status(400).json({
        ok: false,
        message: 'Campo "Recados" é obrigatório.',
      });
    }

    const userExists = users.some((user) => user.email === email);

    if(userExists) {
        return response.status(400).json({
            ok: false,
            message: 'Já existe um usuário cadastrado com o e-mail informado. Tente outro!'
        });
    }

    users.push({
        name,
        email,
        password,
        recados
    })

    return response.status(201).json({
      ok: true,
      message: 'Usuário criado com sucesso!',
      dados: {
        name,
        email,
        password,
        recados,
      },
    });

});


// --------------- RECADOS ----------------------------------------------
app.post('/users/:email/recados', (request: Request, response: Response) => {
    const { email } = request.params;
    const { description, detail } = request.body;

    const user = users.find((user) => user.email === email);

    if(!user) {
        return response.status(404).json({
          ok: false,
          message: 'Nenhum usuário encontrado com o e-mail informado.',
          dados: {},
        });
    }

    const novoRecado: Recado = {
      id: uuid(),
      description,
      detail,
    };

    user?.recados.push(novoRecado);

    return response.status(201).json({
      ok: true,
      message: 'Recado criado com sucesso!',
      dado: novoRecado,
    });
});


app.get('/users/:email/recados', (request: Request, response: Response) => {
    const { email } = request.params;

    const user = users.find((user) => user.email === email);

    if (!user) {
      return response.status(404).json({
        ok: false,
        message: 'Nenhum usuário encontrado com o e-mail informado.',
        dados: {},
      });
    }

    if(user?.recados.length === 0) {
        return response.status(404).json({
          ok: false,
          message: 'Nenhum recado cadastrado ainda para este usuário',
          dados: [],
        });
    }

    return response.status(201).json({
      ok: true,
      message: 'Recados do usuário buscados com sucesso!',
      dados: user?.recados,
    });
});

app.get('/users/:email/recados/:id', (request: Request, response: Response) => {
  const { email, id } = request.params;

  const user = users.find((user) => user.email === email);

  if (!user) {
    return response.status(404).json({
      ok: false,
      message: 'Nenhum usuário encontrado com o e-mail informado.',
      dados: {},
    });
  }

  const recadoEncontrado = user?.recados.find((recado) => recado.id === id);

  if(!recadoEncontrado) {
    return response.status(404).json({
      ok: false,
      message: 'Nenhum recado encontrado com o identificador informado.',
      dados: {},
    });
  }

  return response.status(200).json({
    ok: true,
    message: 'Recado encontrado com sucesso.',
    dados: recadoEncontrado,
  }); 
});


app.put('/users/:email/recados/:id', (request: Request, response: Response) => {
    const { email, id } = request.params;
    const { description, detail } = request.body;

    if (!description) {
      return response.status(400).json({
        ok: false,
        message: 'O campo "Descrição" é obrigatório.',
        dados: {},
      });
    }

    if (!detail) {
      return response.status(400).json({
        ok: false,
        message: 'O campo "Detalhamento" é obrigatório.',
        dados: {},
      });
    }

    const user = users.find((user) => user.email === email) as User;

    if (!user) {
      return response.status(404).json({
        ok: false,
        message: 'Nenhum usuário encontrado com o e-mail informado.',
        dados: {},
      });
    }

    const indiceEncontrado = user.recados.findIndex((recado) => recado.id === id) as number;

    if (indiceEncontrado === -1) {
      return response.status(404).json({
        ok: false,
        message: 'Nenhum recado encontrado com o identificador informado.',
        dados: {},
      });
    }

    const recadoAtualizado: Recado = {
        id,
        description,
        detail,
    }

    user.recados[indiceEncontrado] = recadoAtualizado;

    return response.status(200).json({
      ok: true,
      message: 'Recado atualizado com sucesso',
      dados: recadoAtualizado,
    });

});

app.delete('/users/:email/recados/:id', (request: Request, response: Response) => {
    const { email, id } = request.params;

    const user = users.find((user) => user.email === email) as User;

    if (!user) {
      return response.status(404).json({
        ok: false,
        message: 'Nenhum usuário encontrado com o e-mail informado.',
        dados: {},
      });
    }

    const indiceEncontrado = user.recados.findIndex(
      (recado) => recado.id === id
    ) as number;

    if (indiceEncontrado === -1) {
      return response.status(404).json({
        ok: false,
        message: 'Nenhum recado encontrado com o identificador informado.',
        dados: {},
      });
    }

    user.recados = user.recados.filter((recado) => recado.id !== id);

    return response.status(200).json({
      ok: true,
      message: 'Recado excluido com sucesso!',
      dados: user.recados,
    });

})





