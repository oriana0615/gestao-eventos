import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Text, ActivityIndicator } from 'react-native-paper';
import { 
  BarChart, 
  PieChart, 
  LineChart 
} from 'react-native-chart-kit';
import { useIsFocused } from '@react-navigation/native';
import EventoService from '../../services/EventoService';
import PalestranteService from '../../services/PalestranteService';
import InscricaoService from '../../services/InscricaoService';

const screenWidth = Dimensions.get('window').width;
const chartHeight = 320;


const formatarTexto = (texto) => {
  if (!texto) return '';
  return texto
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^\w\s]/gi, '') 
    .replace(/\s+/g, ' '); // Elimina múltiples espacios
};


const truncarTexto = (texto, maxLength) => {
  if (!texto) return '';
  texto = formatarTexto(texto);
  if (texto.length <= maxLength) return texto;
  return texto.substring(0, maxLength - 3) + '...';
};

// Función para generar colores aleatorios
const gerarCorAleatoria = () => {
  const colors = [
    '#6200ee', '#3700b3', '#03dac6', '#018786', 
    '#bb86fc', '#ff7597', '#ff0266', '#f5f5f5'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function DashboardScreen() {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    eventos: 0,
    palestrantes: 0,
    inscricoes: 0,
    eventosPorMes: [],
    inscricoesPorEvento: [],
    palestrantesPorEspecialidade: []
  });

  useEffect(() => {
    if (isFocused) {
      fetchStats();
    }
  }, [isFocused]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [eventos, palestrantes, inscricoes] = await Promise.all([
        EventoService.listar(),
        PalestranteService.listar(),
        InscricaoService.listar()
      ]);

      const eventosPorMes = calcularEventosPorMes(eventos);
      const inscricoesPorEvento = calcularInscricoesPorEvento(inscricoes, eventos);
      const palestrantesPorEspecialidade = calcularPalestrantesPorEspecialidade(palestrantes);

      setStats({
        eventos: eventos.length,
        palestrantes: palestrantes.length,
        inscricoes: inscricoes.length,
        eventosPorMes,
        inscricoesPorEvento,
        palestrantesPorEspecialidade
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar as estatísticas.");
    }
    setLoading(false);
  };

  const calcularEventosPorMes = (eventos) => {
    const meses = Array(12).fill(0);
    eventos.forEach(evento => {
      const dataParts = evento.data.split('/');
      if (dataParts.length === 3) {
        const dataEvento = new Date(`${dataParts[2]}-${dataParts[1]}-${dataParts[0]}`);
        if (!isNaN(dataEvento.getTime())) {
          const mes = dataEvento.getMonth();
          meses[mes]++;
        }
      }
    });
    return meses;
  };

  const calcularInscricoesPorEvento = (inscricoes, eventos) => {
    if (!eventos || eventos.length === 0) return [];
    return eventos.map(evento => ({
      nome: truncarTexto(evento.nome, 10),
      nomeCompleto: evento.nome,
      inscricoes: inscricoes.filter(i => i.evento_id == evento.id).length
    }));
  };

  const calcularPalestrantesPorEspecialidade = (palestrantes) => {
    if (!palestrantes || palestrantes.length === 0) return [];
    
    const contagem = {};
    palestrantes.forEach(palestrante => {
      const especialidade = palestrante.especialidade || 'Não definida';
      const especialidadeFormatada = truncarTexto(especialidade, 15);
      contagem[especialidadeFormatada] = (contagem[especialidadeFormatada] || 0) + 1;
    });

    return Object.keys(contagem).map(key => ({
      name: key,
      nameCompleto: key,
      population: contagem[key],
      color: gerarCorAleatoria(),
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Dashboard Analítico</Title>
      </View>

      {/* Cards de Resumo */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Title style={styles.statNumber}>{stats.eventos}</Title>
            <Paragraph style={styles.statLabel}>Eventos</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content>
            <Title style={styles.statNumber}>{stats.palestrantes}</Title>
            <Paragraph style={styles.statLabel}>Palestrantes</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content>
            <Title style={styles.statNumber}>{stats.inscricoes}</Title>
            <Paragraph style={styles.statLabel}>Inscrições</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Gráfico de Eventos por Mês */}
      <Card style={styles.chartCard}>
        <Card.Content style={styles.chartContent}>
          <Title style={styles.chartTitle}>Eventos por Mês</Title>
         <BarChart
  data={{
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [{ data: stats.eventosPorMes }],
  }}
  width={screenWidth - 30} 
  height={240} 
  yAxisLabel=""
  yAxisSuffix=""
  fromZero
  showBarTops={false}
  showValuesOnTopOfBars={true} 
  chartConfig={{
    backgroundColor: '#ffffff', 
    backgroundGradientFrom: '#6200ee', 
    backgroundGradientTo: '#3700b3',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 11, 
    },
    barPercentage: 0.7, 
  }}
  style={{
    marginVertical: 8,
    borderRadius: 16,
    
  }}
  verticalLabelRotation={0} 
/>
        </Card.Content>
      </Card>

      {/* Gráfico de Inscrições por Evento */}
      <Card style={styles.chartCard}>
        <Card.Content style={styles.chartContent}>
          <Title style={styles.chartTitle}>Inscrições por Evento</Title>
          {stats.inscricoesPorEvento.length > 0 ? (
            <LineChart
              data={{
                labels: stats.inscricoesPorEvento.map(item => item.nome),
                datasets: [{ 
                  data: stats.inscricoesPorEvento.map(item => item.inscricoes),
                  strokeWidth: 2
                }]
              }}
              width={screenWidth - 40}
              height={chartHeight}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
              bezier
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForLabels: { fontSize: 10 },
                propsForVerticalLabels: {
                  rotation: -60,
                  fontSize: 9,
                  width: 40,
                  paddingTop: 20
                },
                strokeWidth: 2,
              }}
              style={{ 
                marginVertical: 8,
                borderRadius: 16,
                marginLeft: -20
              }}
              verticalLabelRotation={60}
              getDotColor={() => '#6200ee'}
            />
          ) : (
            <Text style={styles.noDataText}>Sem dados de inscrição para mostrar</Text>
          )}
        </Card.Content>
      </Card>

      {/* Gráfico de Palestrantes por Especialidade */}
      <Card style={styles.chartCard}>
        <Card.Content style={styles.chartContent}>
          <Title style={styles.chartTitle}>Palestrantes por Especialidade</Title>
          {stats.palestrantesPorEspecialidade.length > 0 ? (
            <View style={styles.pieChartContainer}>
              <PieChart
                data={stats.palestrantesPorEspecialidade}
                width={screenWidth - 40}
                height={220}
                chartConfig={{ 
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  propsForLabels: { fontSize: 10 }
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 0]}
                absolute
                hasLegend
                legend={{
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              />
              <Text style={styles.chartNote}>* Toque nas legendas para destacar</Text>
            </View>
          ) : (
            <Text style={styles.noDataText}>Sem dados de palestrantes para mostrar</Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollContent: {
    paddingBottom: 30
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 20,
    marginTop: 10
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6200ee',
    textAlign: 'center',
    marginBottom: 2
  },
  statLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666'
  },
  chartCard: {
    marginHorizontal: 15,
    marginBottom: 25,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
    backgroundColor: '#fff'
  },
  chartContent: {
    paddingHorizontal: 5,
    paddingVertical: 15,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333'
  },
  noDataText: {
    textAlign: 'center',
    paddingVertical: 50,
    color: '#777',
    fontSize: 14
  },
  pieChartContainer: {
    alignItems: 'center',
    width: '100%'
  },
  chartNote: {
    fontSize: 10,
    color: '#777',
    marginTop: 5,
    fontStyle: 'italic'
  }
});