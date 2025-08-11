import React from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Circle,
  Line,
  SvgText,
} from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

class LightweightChart extends React.Component {
  constructor(props) {
    super(props);
    this.defaultConfig = {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      color: (opacity = 1) => `rgba(81, 149, 72, ${opacity})`,
      strokeWidth: 2,
      barPercentage: 0.7,
      useShadowColorFromDataset: false,
      decimalPlaces: 0,
      fillShadowGradient: '#519548',
      fillShadowGradientOpacity: 0.1,
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: '#519548',
      },
    };
  }

  /**
   * 渲染線性圖表
   */
  renderLineChart() {
    const { data, width = screenWidth - 32, height = 220, chartConfig = {} } = this.props;
    const config = { ...this.defaultConfig, ...chartConfig };
    if (!data || !data.datasets || data.datasets.length === 0) {
      return this.renderEmptyChart(width, height, '無數據');
    }
    const dataset = data.datasets[0];
    const values = dataset.data || [];
    const labels = data.labels || [];
    if (values.length === 0) {
      return this.renderEmptyChart(width, height, '無數據點');
    }
    // 計算圖表區域
    const chartWidth = width - 80;
    const chartHeight = height - 80;
    const offsetX = 50;
    const offsetY = 20;
    // 計算數據範圍
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;
    // 生成路徑點
    const points = values.map((value, index) => {
      const x = offsetX + (index / (values.length - 1)) * chartWidth;
      const y = offsetY + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      return { x, y, value };
    });
      // 生成路徑字符串
    const pathData = points.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x} ${point.y}`;
    }, '');
      // 生成填充路徑
    const fillPath = `${pathData} L ${points[points.length - 1].x} ${offsetY + chartHeight} L ${offsetX} ${offsetY + chartHeight} Z`;
    return (
      <View style={[styles.chartContainer, { width, height }]}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={config.color(0.3)} />
              <Stop offset="1" stopColor={config.color(0.05)} />
            </LinearGradient>
          </Defs>
          {/* 背景 */}
          <Rect width={width} height={height} fill={config.backgroundColor} />
          {/* 網格線 */}
          {this.renderGridLines(chartWidth, chartHeight, offsetX, offsetY, config)}
          {/* 填充區域 */}
          <Path d={fillPath} fill="url(#fillGradient)" />
          {/* 線條 */}
          <Path
            d={pathData}
            stroke={config.color(1)}
            strokeWidth={config.strokeWidth}
            fill="none"
          />
          {/* 數據點 */}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={config.propsForDots.r}
              fill={config.backgroundColor}
              stroke={config.propsForDots.stroke}
              strokeWidth={config.propsForDots.strokeWidth}
            />
          ))}
          {/* Y軸標籤 */}
          {this.renderYAxisLabels(minValue, maxValue, chartHeight, offsetX, offsetY, config)}
          {/* X軸標籤 */}
          {this.renderXAxisLabels(labels, chartWidth, offsetX, offsetY + chartHeight, config)}
        </Svg>
      </View>
    );
  }

  /**
   * 渲染柱狀圖表
   */
  renderBarChart() {
    const { data, width = screenWidth - 32, height = 220, chartConfig = {} } = this.props;
    const config = { ...this.defaultConfig, ...chartConfig };
    if (!data || !data.datasets || data.datasets.length === 0) {
      return this.renderEmptyChart(width, height, '無數據');
    }
    const dataset = data.datasets[0];
    const values = dataset.data || [];
    const labels = data.labels || [];
    if (values.length === 0) {
      return this.renderEmptyChart(width, height, '無數據點');
    }
    // 計算圖表區域
    const chartWidth = width - 80;
    const chartHeight = height - 80;
    const offsetX = 50;
    const offsetY = 20;
    // 計算數據範圍
    const maxValue = Math.max(...values);
    const barWidth = (chartWidth / values.length) * config.barPercentage;
    const barSpacing = chartWidth / values.length;
    return (
      <View style={[styles.chartContainer, { width, height }]}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={config.color(0.8)} />
              <Stop offset="1" stopColor={config.color(0.4)} />
            </LinearGradient>
          </Defs>
          {/* 背景 */}
          <Rect width={width} height={height} fill={config.backgroundColor} />
          {/* 網格線 */}
          {this.renderGridLines(chartWidth, chartHeight, offsetX, offsetY, config)}
          {/* 柱狀圖 */}
          {values.map((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = offsetX + index * barSpacing + (barSpacing - barWidth) / 2;
            const y = offsetY + chartHeight - barHeight;
            return (
              <Rect
                key={index}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="url(#barGradient)"
                rx={2}
              />
            );
          })}
          {/* Y軸標籤 */}
          {this.renderYAxisLabels(0, maxValue, chartHeight, offsetX, offsetY, config)}
          {/* X軸標籤 */}
          {this.renderXAxisLabels(labels, chartWidth, offsetX, offsetY + chartHeight, config)}
        </Svg>
      </View>
    );
  }

  /**
   * 渲染餅圖
   */
  renderPieChart() {
    const { data, width = screenWidth - 32, height = 220, chartConfig = {} } = this.props;
    const config = { ...this.defaultConfig, ...chartConfig };
    if (!data || !data.datasets || data.datasets.length === 0) {
      return this.renderEmptyChart(width, height, '無數據');
    }
    const dataset = data.datasets[0];
    const values = dataset.data || [];
    const labels = data.labels || [];
    if (values.length === 0) {
      return this.renderEmptyChart(width, height, '無數據點');
    }
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    const total = values.reduce((sum, value) => sum + value, 0);
    let currentAngle = -Math.PI / 2; // 從頂部開始
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    ];
    return (
      <View style={[styles.chartContainer, { width, height }]}>
        <Svg width={width} height={height}>
          {/* 背景 */}
          <Rect width={width} height={height} fill={config.backgroundColor} />
          {/* 餅圖扇形 */}
          {values.map((value, index) => {
            const angle = (value / total) * 2 * Math.PI;
            const endAngle = currentAngle + angle;
            const x1 = centerX + radius * Math.cos(currentAngle);
            const y1 = centerY + radius * Math.sin(currentAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);
            const largeArcFlag = angle > Math.PI ? 1 : 0;
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z',
            ].join(' ');
            const slice = (
              <Path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                stroke={config.backgroundColor}
                strokeWidth={2}
              />
            );
            currentAngle = endAngle;
            return slice;
          })}
          {/* 中心圓 */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.3}
            fill={config.backgroundColor}
          />
        </Svg>
        {/* 圖例 */}
        {this.renderPieLegend(labels, values, colors, total)}
      </View>
    );
  }

  /**
   * 渲染網格線
   */
  renderGridLines(chartWidth, chartHeight, offsetX, offsetY, config) {
    const gridLines = [];
    const numLines = 5;
    // 水平網格線
    for (let i = 0; i <= numLines; i++) {
      const y = offsetY + (i / numLines) * chartHeight;
      gridLines.push(
        <Line
          key={`h-${i}`}
          x1={offsetX}
          y1={y}
          x2={offsetX + chartWidth}
          y2={y}
          stroke={config.color(0.1)}
          strokeWidth={1}
        />,
      );
    }
    return gridLines;
  }

  /**
   * 渲染Y軸標籤
   */
  renderYAxisLabels(minValue, maxValue, chartHeight, offsetX, offsetY, config) {
    const labels = [];
    const numLabels = 5;
    for (let i = 0; i <= numLabels; i++) {
      const value = minValue + (maxValue - minValue) * (1 - i / numLabels);
      const y = offsetY + (i / numLabels) * chartHeight;
      labels.push(
        <SvgText
          key={`y-${i}`}
          x={offsetX - 10}
          y={y + 4}
          fontSize={10}
          fill={config.color(0.6)}
          textAnchor="end"
        >
          {Math.round(value)}
        </SvgText>,
      );
    }
    return labels;
  }

  /**
   * 渲染X軸標籤
   */
  renderXAxisLabels(dataLabels, chartWidth, offsetX, baseY, config) {
    const labels = [];
    dataLabels.forEach((label, index) => {
      const x = offsetX + (index / (dataLabels.length - 1)) * chartWidth;
      labels.push(
        <SvgText
          key={`x-${index}`}
          x={x}
          y={baseY + 20}
          fontSize={10}
          fill={config.color(0.6)}
          textAnchor="middle"
        >
          {label}
        </SvgText>,
      );
    });
    return labels;
  }

  /**
   * 渲染餅圖圖例
   */
  renderPieLegend(labels, values, colors, total) {
    return (
      <View style={styles.legend}>
        {labels.map((label, index) => {
          const percentage = ((values[index] / total) * 100).toFixed(1);
          return (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: colors[index % colors.length] },
                ]}
              />
              <Text style={styles.legendText}>
                {label}: {percentage}%
              </Text>
            </View>
          );
        })}
      </View>
    );
  }

  /**
   * 渲染空圖表
   */
  renderEmptyChart(width, height, message) {
    return (
      <View style={[styles.chartContainer, styles.emptyChart, { width, height }]}>
        <Text style={styles.emptyMessage}>{message}</Text>
      </View>
    );
  }

  render() {
    const { type = 'line' } = this.props;
    switch (type) {
      case 'bar':
        return this.renderBarChart();
      case 'pie':
        return this.renderPieChart();
      case 'line':
      default:
        return this.renderLineChart();
    }
  }
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 2,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyChart: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  emptyMessage: {
    color: '#6c757d',
    fontSize: 14,
    fontStyle: 'italic',
  },
  legend: {
    bottom: 10,
    left: 10,
    position: 'absolute',
    right: 10,
  },
  legendColor: {
    borderRadius: 6,
    height: 12,
    marginRight: 8,
    width: 12,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 2,
  },
  legendText: {
    color: '#666',
    fontSize: 10,
  },
});

export default LightweightChart;
