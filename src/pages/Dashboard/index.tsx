import React, { useState, useEffect, FormEvent } from 'react'
import { FiChevronRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import api from '../../services/api'

import logoImg from '../../assets/logo.svg'
import { Title, Form, Repositories, Error } from './styles'

interface Repository {
  full_name: string
  description: string
  owner: {
    login: string
    avatar_url: string
  }
}

const Dashboard: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>(() => {
    const storagedRepositories = localStorage.getItem(
      '@GithubExplorer:repositories',
    )
    if (storagedRepositories) {
      return JSON.parse(storagedRepositories)
    }
    return []
  })
  const [newRepo, setNewRepo] = useState('')
  const [inputError, setInputError] = useState('')

  useEffect(() => {
    localStorage.setItem(
      '@GithubExplorer:repositories',
      JSON.stringify(repositories),
    )
  }, [repositories])

  async function handleAddRepository(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault()
    setInputError('')

    if (!newRepo) {
      setInputError('Digite autor/nome do repositório.')
      return
    }

    const existRepoIndex = repositories.findIndex(
      repo => repo.full_name.toLowerCase() === newRepo.toLowerCase(),
    )

    if (existRepoIndex >= 0) {
      setInputError('O repositório já foi listado.')
      setNewRepo('')
      return
    }

    try {
      const response = await api.get<Repository>(`/repos/${newRepo}`)
      const repository = response.data

      setRepositories([...repositories, repository])
    } catch (err) {
      setInputError('Não foi possível encontrar esse repositório.')
    }

    setNewRepo('')
  }

  return (
    <>
      <img src={logoImg} alt="Github Explorer" />
      <Title>Explore repositórios no Github</Title>

      <Form hasError={!!inputError} onSubmit={handleAddRepository}>
        <input
          value={newRepo}
          onChange={e => setNewRepo(e.target.value)}
          placeholder="Digite o nome do repositório"
        />
        <button type="submit">Pesquisar</button>
      </Form>

      {inputError && <Error>{inputError}</Error>}

      <Repositories>
        {repositories.map(repo => (
          <Link key={repo.full_name} to={`/repositories/${repo.full_name}`}>
            <img src={repo.owner.avatar_url} alt={repo.owner.login} />
            <div>
              <strong>{repo.full_name}</strong>
              <p>{repo.description}</p>
            </div>

            <FiChevronRight size={20} />
          </Link>
        ))}
      </Repositories>
    </>
  )
}

export default Dashboard
