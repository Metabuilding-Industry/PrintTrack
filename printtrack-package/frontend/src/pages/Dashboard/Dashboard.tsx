import React from 'react';
import { Box, Typography, Grid, Paper, Button, Card, CardContent, CardActions, Chip, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Description as DescriptionIcon, 
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Composants stylisés
const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
}));

const BonCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 8,
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => {
  let color;
  switch (status) {
    case 'en_attente':
      color = theme.palette.info.main;
      break;
    case 'en_cours':
      color = theme.palette.warning.main;
      break;
    case 'termine':
      color = theme.palette.success.main;
      break;
    case 'annule':
      color = theme.palette.error.main;
      break;
    default:
      color = theme.palette.grey[500];
  }
  return {
    backgroundColor: color,
    color: theme.palette.getContrastText(color),
    fontWeight: 'bold'
  };
});

// Données fictives pour la démo
const mockStats = {
  bonsTotal: 124,
  bonsEnCours: 18,
  bonsTermines: 98,
  incidents: 7,
  machinesActives: 5
};

const mockBonsRecents = [
  { id: 'BF-2025-0124', client: 'Imprimerie Moderne', travail: 'Brochures promotionnelles', machine: 'Offset Heidelberg XL 106', status: 'en_cours', progression: 65 },
  { id: 'BF-2025-0123', client: 'Éditions du Soleil', travail: 'Couvertures de livres', machine: 'Héliogravure KBA RotaJET', status: 'en_attente', progression: 0 },
  { id: 'BF-2025-0122', client: 'Packaging Premium', travail: 'Emballages alimentaires', machine: 'Offset Komori GL-840', status: 'termine', progression: 100 },
  { id: 'BF-2025-0121', client: 'Agence Graphique', travail: 'Affiches grand format', machine: 'Héliogravure Bobst MW 85F', status: 'en_cours', progression: 30 }
];

const mockIncidents = [
  { id: 'INC-2025-0018', machine: 'Offset Heidelberg XL 106', type: 'Mécanique', gravite: 'moyenne', status: 'en_cours' },
  { id: 'INC-2025-0017', machine: 'Héliogravure KBA RotaJET', type: 'Électrique', gravite: 'elevee', status: 'ouvert' }
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fonction pour traduire les statuts
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'annule': return 'Annulé';
      case 'ouvert': return 'Ouvert';
      case 'resolu': return 'Résolu';
      default: return status;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>

      {/* Statistiques générales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="text.secondary">
                Bons de fabrication
              </Typography>
              <DescriptionIcon color="primary" />
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
              {mockStats.bonsTotal}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {mockStats.bonsEnCours} en cours • {mockStats.bonsTermines} terminés
            </Typography>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="text.secondary">
                Incidents actifs
              </Typography>
              <WarningIcon sx={{ color: '#f44336' }} />
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
              {mockStats.incidents}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              2 critiques • 5 en cours de résolution
            </Typography>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="text.secondary">
                Contrôles qualité
              </Typography>
              <CheckCircleIcon sx={{ color: '#4caf50' }} />
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
              94%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Taux de conformité ce mois
            </Typography>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="text.secondary">
                Machines actives
              </Typography>
              <PrintIcon color="primary" />
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
              {mockStats.machinesActives}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              3 offset • 2 héliogravure
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Bons de fabrication récents */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Bons de fabrication récents
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mockBonsRecents.map((bon) => (
          <Grid item xs={12} sm={6} md={3} key={bon.id}>
            <BonCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" component="div">
                    {bon.id}
                  </Typography>
                  <StatusChip 
                    label={getStatusLabel(bon.status)} 
                    status={bon.status} 
                    size="small" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {bon.client}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {bon.travail}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {bon.machine}
                </Typography>
                {bon.status === 'en_cours' && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Progression</Typography>
                      <Typography variant="body2">{bon.progression}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={bon.progression} />
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/bons/${bon.id}`)}>
                  Voir détails
                </Button>
              </CardActions>
            </BonCard>
          </Grid>
        ))}
      </Grid>

      {/* Incidents récents */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Incidents récents
      </Typography>
      <Grid container spacing={3}>
        {mockIncidents.map((incident) => (
          <Grid item xs={12} sm={6} key={incident.id}>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" component="div">
                  {incident.id}
                </Typography>
                <Chip 
                  label={getStatusLabel(incident.status)} 
                  color={incident.status === 'ouvert' ? 'error' : 'warning'} 
                  size="small" 
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {incident.machine}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Box>
                  <Typography variant="body2">
                    Type: <strong>{incident.type}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Gravité: <strong>{incident.gravite}</strong>
                  </Typography>
                </Box>
                <Button size="small" variant="outlined" color="primary" onClick={() => navigate(`/incidents/${incident.id}`)}>
                  Gérer
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
