import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, Modal, message, Typography, Divider } from 'antd';
import { useSelector } from 'react-redux';
import { researchService } from '../../services/researchService';

const { Title, Paragraph } = Typography;

const PublicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [publication, setPublication] = useState(null);
  const [error, setError] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);

  useEffect(() => {
    const fetchPublication = async () => {
      setLoading(true);
      try {
        const data = await researchService.getPublicationById(id);
        setPublication(data);
        setError(null);
      } catch (err) {
        setError('Failed to load publication details');
      } finally {
        setLoading(false);
      }
    };
    fetchPublication();
  }, [id]);

  // Fetch authors
  useEffect(() => {
    if (!id) return;
    const fetchAuthors = async () => {
      setAuthorLoading(true);
      try {
        const data = await researchService.getPublicationAuthors(id);
        setAuthors(data);
      } catch {
        message.error('Failed to load authors');
      } finally {
        setAuthorLoading(false);
      }
    };
    fetchAuthors();
  }, [id]);

  // Fetch files
  useEffect(() => {
    if (!id) return;
    const fetchFiles = async () => {
      setFileLoading(true);
      try {
        const data = await researchService.getPublicationFiles(id);
        setFiles(data);
      } catch {
        message.error('Failed to load files');
      } finally {
        setFileLoading(false);
      }
    };
    fetchFiles();
  }, [id]);

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Publication',
      content: 'Are you sure you want to delete this publication?',
      onOk: async () => {
        try {
          await researchService.deletePublication(id);
          message.success('Publication deleted');
          navigate('/app/research/publications');
        } catch {
          message.error('Failed to delete publication');
        }
      },
    });
  };

  // Add author handler
  const handleAddAuthor = async (authorData) => {
    setAuthorLoading(true);
    try {
      await researchService.addAuthorToPublication(id, authorData);
      message.success('Author added');
      const data = await researchService.getPublicationAuthors(id);
      setAuthors(data);
    } catch {
      message.error('Failed to add author');
    } finally {
      setAuthorLoading(false);
    }
  };

  // Remove author handler
  const handleRemoveAuthor = async (authorId) => {
    setAuthorLoading(true);
    try {
      await researchService.removeAuthorFromPublication(id, authorId);
      message.success('Author removed');
      setAuthors(authors.filter(a => a.id !== authorId));
    } catch {
      message.error('Failed to remove author');
    } finally {
      setAuthorLoading(false);
    }
  };

  // Upload file handler
  const handleFileUpload = async ({ file }) => {
    setFileLoading(true);
    try {
      await researchService.uploadPublicationFile(id, file);
      message.success('File uploaded');
      const data = await researchService.getPublicationFiles(id);
      setFiles(data);
    } catch {
      message.error('Failed to upload file');
    } finally {
      setFileLoading(false);
    }
  };

  // Delete file handler
  const handleDeleteFile = async (fileId) => {
    setFileLoading(true);
    try {
      await researchService.deletePublicationFile(id, fileId);
      message.success('File deleted');
      setFiles(files.filter(f => f.id !== fileId));
    } catch {
      message.error('Failed to delete file');
    } finally {
      setFileLoading(false);
    }
  };

  if (loading) return <Spin />;
  if (error) return <Paragraph type="danger">{error}</Paragraph>;
  if (!publication) return <Paragraph>No publication found.</Paragraph>;

  // Only allow edit/delete/author/file actions if admin or owner (researcher)
  const isOwner = user && user.role === 'researcher' ? publication.submitted_by === user.id : true;

  return (
    <div>
      <Title level={2}>{publication.title}</Title>
      <Paragraph>{publication.abstract}</Paragraph>
      <Divider />
      {isOwner && <Button type="primary" onClick={() => {/* TODO: Edit logic */}}>Edit</Button>}
      {isOwner && <Button danger onClick={handleDelete} style={{ marginLeft: 8 }}>Delete</Button>}
      <Divider>Authors</Divider>
      {authorLoading ? <Spin /> : (
        <ul>
          {authors.map(author => (
            <li key={author.id}>
              {author.name} {isOwner && <Button size="small" danger onClick={() => handleRemoveAuthor(author.id)}>Remove</Button>}
            </li>
          ))}
        </ul>
      )}
      {isOwner && <Button onClick={() => handleAddAuthor({ name: prompt('Author name:') })} type="dashed">Add Author</Button>}
      <Divider>Files</Divider>
      {fileLoading ? <Spin /> : (
        <ul>
          {files.map(file => (
            <li key={file.id}>
              <a href={file.file} target="_blank" rel="noopener noreferrer">{file.name || file.file}</a>
              {isOwner && <Button size="small" danger onClick={() => handleDeleteFile(file.id)} style={{ marginLeft: 8 }}>Delete</Button>}
            </li>
          ))}
        </ul>
      )}
      {isOwner && (
        <Button type="dashed" style={{ marginTop: 8 }}>
          <label style={{ cursor: 'pointer' }}>
            Upload File
            <input type="file" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleFileUpload({ file: e.target.files[0] })} />
          </label>
        </Button>
      )}
    </div>
  );
};

export default PublicationDetailPage;
