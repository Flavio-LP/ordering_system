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
    <div style={{ maxWidth: 800, margin: 'auto', padding: 20 }}>
      <h1>Cadastro de Pessoas</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <div style={{ marginBottom: 10 }}>
          <input 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
            placeholder="Nome" 
            required 
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input 
            value={sobrenome} 
            onChange={e => setSobrenome(e.target.value)} 
            placeholder="Sobrenome" 
            required 
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input 
            value={empresa} 
            onChange={e => setEmpresa(e.target.value)} 
            placeholder="Empresa" 
            required 
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input 
            value={setor} 
            onChange={e => setSetor(e.target.value)} 
            placeholder="Setor" 
            required 
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>Cadastrar Pessoa</button>
      </form>

      <div style={{ marginBottom: 20 }}>
        <input 
          value={searchTerm} 
          onChange={e => handleSearch(e.target.value)} 
          placeholder="Buscar por nome..." 
          style={{ width: '100%', padding: 10, fontSize: 16 }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Nome</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Sobrenome</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Empresa</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Setor</th>
          </tr>
        </thead>
        <tbody>
          {pessoas.map(pessoa => (
            <tr key={pessoa.id}>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{pessoa.nome}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{pessoa.sobrenome}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{pessoa.empresa}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{pessoa.setor}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={{ padding: '8px 16px' }}
        >
          Anterior
        </button>
        <span style={{ padding: '8px 16px' }}>
          Página {currentPage} de {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={{ padding: '8px 16px' }}
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default PessoaForm;