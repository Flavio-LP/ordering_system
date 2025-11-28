import React, { useState, useEffect } from 'react';

interface Pessoa {
  id: number;
  nome: string;
  sobrenome: string;
  empresa: string;
  setor: string;
}

const PessoaForm: React.FC = () => {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [setor, setSetor] = useState('');
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPessoas();
  }, [currentPage, searchTerm]);

  const fetchPessoas = async () => {
    const response = await fetch(`/api/pessoas?page=${currentPage}&per_page=${itemsPerPage}&search=${searchTerm}`);
    const data = await response.json();
    setPessoas(data.pessoas || data);
    setTotalPages(data.total_pages || Math.ceil(data.length / itemsPerPage));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/pessoas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pessoa: { nome, sobrenome, empresa, setor } }),
    });
    setNome('');
    setSobrenome('');
    setEmpresa('');
    setSetor('');
    setCurrentPage(1);
    fetchPessoas();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div>
      <h1>Cadastro de Pessoas</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <input 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
            placeholder="Nome" 
            required 
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input 
            value={sobrenome} 
            onChange={e => setSobrenome(e.target.value)} 
            placeholder="Sobrenome" 
            required 
          />
        </div>
        <div>
          <input 
            value={empresa} 
            onChange={e => setEmpresa(e.target.value)} 
            placeholder="Empresa" 
            required 
          />
        </div>
        <div>
          <input 
            value={setor} 
            onChange={e => setSetor(e.target.value)} 
            placeholder="Setor" 
            required
          />
        </div>
        <button type="submit">Cadastrar Pessoa</button>
      </form>

      <div>
        <input 
          value={searchTerm} 
          onChange={e => handleSearch(e.target.value)} 
          placeholder="Buscar por nome..." 
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Sobrenome</th>
            <th>Empresa</th>
            <th>Setor</th>
          </tr>
        </thead>
        <tbody>
          {pessoas.map(pessoa => (
            <tr key={pessoa.id}>
              <td>{pessoa.nome}</td>
              <td>{pessoa.sobrenome}</td>
              <td>{pessoa.empresa}</td>
              <td>{pessoa.setor}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default PessoaForm;