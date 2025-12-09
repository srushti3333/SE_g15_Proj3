// Chart configuration presets and customization utilities

export interface ChartTheme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  background: string;
  text: string;
  grid: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'radar' | 'composed';
  theme: ChartTheme;
  responsive: boolean;
  animation: boolean;
  legend: boolean;
  tooltip: boolean;
  grid: boolean;
}

export const defaultTheme: ChartTheme = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  warning: '#ff9800',
  danger: '#ff6b6b',
  info: '#2196f3',
  background: '#ffffff',
  text: '#333333',
  grid: '#e0e0e0',
};

export const darkTheme: ChartTheme = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#66bb6a',
  warning: '#ffa726',
  danger: '#ef5350',
  info: '#42a5f5',
  background: '#1e1e1e',
  text: '#ffffff',
  grid: '#424242',
};

export class ChartConfigurations {
  /**
   * Get default line chart configuration
   */
  static getLineChartConfig(theme: ChartTheme = defaultTheme): any {
    return {
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      cartesianGrid: {
        strokeDasharray: '3 3',
        stroke: theme.grid,
      },
      xAxis: {
        stroke: theme.text,
        tick: { fill: theme.text },
      },
      yAxis: {
        stroke: theme.text,
        tick: { fill: theme.text },
      },
      line: {
        strokeWidth: 2,
        dot: { r: 4 },
        activeDot: { r: 6 },
      },
      tooltip: {
        contentStyle: {
          backgroundColor: theme.background,
          border: `1px solid ${theme.grid}`,
          borderRadius: '4px',
        },
      },
      legend: {
        wrapperStyle: {
          paddingTop: '20px',
        },
      },
    };
  }

  /**
   * Get default bar chart configuration
   */
  static getBarChartConfig(theme: ChartTheme = defaultTheme): any {
    return {
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      cartesianGrid: {
        strokeDasharray: '3 3',
        stroke: theme.grid,
      },
      xAxis: {
        stroke: theme.text,
        tick: { fill: theme.text },
      },
      yAxis: {
        stroke: theme.text,
        tick: { fill: theme.text },
      },
      bar: {
        radius: [8, 8, 0, 0],
      },
      tooltip: {
        contentStyle: {
          backgroundColor: theme.background,
          border: `1px solid ${theme.grid}`,
          borderRadius: '4px',
        },
      },
    };
  }

  /**
   * Get default pie chart configuration
   */
  static getPieChartConfig(theme: ChartTheme = defaultTheme): any {
    return {
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      pie: {
        innerRadius: 0,
        outerRadius: 100,
        paddingAngle: 2,
        label: true,
      },
      tooltip: {
        contentStyle: {
          backgroundColor: theme.background,
          border: `1px solid ${theme.grid}`,
          borderRadius: '4px',
        },
      },
      legend: {
        verticalAlign: 'bottom',
        height: 36,
      },
    };
  }

  /**
   * Get default area chart configuration
   */
  static getAreaChartConfig(theme: ChartTheme = defaultTheme): any {
    return {
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      cartesianGrid: {
        strokeDasharray: '3 3',
        stroke: theme.grid,
      },
      xAxis: {
        stroke: theme.text,
        tick: { fill: theme.text },
      },
      yAxis: {
        stroke: theme.text,
        tick: { fill: theme.text },
      },
      area: {
        fillOpacity: 0.6,
        strokeWidth: 2,
      },
      tooltip: {
        contentStyle: {
          backgroundColor: theme.background,
          border: `1px solid ${theme.grid}`,
          borderRadius: '4px',
        },
      },
    };
  }

  /**
   * Get default radar chart configuration
   */
  static getRadarChartConfig(theme: ChartTheme = defaultTheme): any {
    return {
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      polarGrid: {
        stroke: theme.grid,
      },
      polarAngleAxis: {
        tick: { fill: theme.text },
      },
      polarRadiusAxis: {
        tick: { fill: theme.text },
      },
      radar: {
        fillOpacity: 0.6,
        strokeWidth: 2,
      },
      tooltip: {
        contentStyle: {
          backgroundColor: theme.background,
          border: `1px solid ${theme.grid}`,
          borderRadius: '4px',
        },
      },
    };
  }

  /**
   * Get color scheme for multiple series
   */
  static getColorScheme(count: number, theme: ChartTheme = defaultTheme): string[] {
    const baseColors = [
      theme.primary,
      theme.success,
      theme.warning,
      theme.danger,
      theme.info,
      theme.secondary,
    ];

    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    const colors = [...baseColors];
    const step = 360 / (count - baseColors.length);

    for (let i = baseColors.length; i < count; i++) {
      const hue = (i - baseColors.length) * step;
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }

    return colors;
  }

  /**
   * Get gradient definition for area charts
   */
  static getGradientDef(id: string, color: string): any {
    return {
      id,
      x1: '0',
      y1: '0',
      x2: '0',
      y2: '1',
      stops: [
        { offset: '5%', stopColor: color, stopOpacity: 0.8 },
        { offset: '95%', stopColor: color, stopOpacity: 0.1 },
      ],
    };
  }

  /**
   * Format axis tick values
   */
  static formatAxisTick(value: number, type: 'currency' | 'number' | 'percentage'): string {
    switch (type) {
      case 'currency':
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
        return `$${value}`;

      case 'percentage':
        return `${value}%`;

      case 'number':
      default:
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toString();
    }
  }

  /**
   * Get custom tooltip formatter
   */
  static getTooltipFormatter(type: 'currency' | 'number' | 'percentage') {
    return (value: number) => {
      switch (type) {
        case 'currency':
          return `$${value.toLocaleString()}`;
        case 'percentage':
          return `${value.toFixed(1)}%`;
        case 'number':
        default:
          return value.toLocaleString();
      }
    };
  }

  /**
   * Get responsive chart dimensions
   */
  static getResponsiveDimensions(containerWidth: number): {
    width: number;
    height: number;
  } {
    const aspectRatio = 16 / 9;
    const maxHeight = 500;
    const minHeight = 300;

    let height = containerWidth / aspectRatio;
    height = Math.max(minHeight, Math.min(maxHeight, height));

    return {
      width: containerWidth,
      height,
    };
  }

  /**
   * Get animation configuration
   */
  static getAnimationConfig(duration: number = 1000): any {
    return {
      animationBegin: 0,
      animationDuration: duration,
      animationEasing: 'ease-in-out',
    };
  }

  /**
   * Get legend configuration
   */
  static getLegendConfig(position: 'top' | 'bottom' | 'left' | 'right' = 'bottom'): any {
    const configs = {
      top: { verticalAlign: 'top', height: 36 },
      bottom: { verticalAlign: 'bottom', height: 36 },
      left: { layout: 'vertical', verticalAlign: 'middle', align: 'left', width: 100 },
      right: { layout: 'vertical', verticalAlign: 'middle', align: 'right', width: 100 },
    };

    return configs[position];
  }

  /**
   * Get custom label formatter for pie charts
   */
  static getPieLabelFormatter(showPercentage: boolean = true) {
    return (entry: any) => {
      if (showPercentage) {
        return `${entry.name}: ${entry.percent?.toFixed(0)}%`;
      }
      return `${entry.name}: ${entry.value}`;
    };
  }

  /**
   * Get stacked bar configuration
   */
  static getStackedBarConfig(stackId: string = 'stack'): any {
    return {
      stackId,
      barSize: 40,
    };
  }

  /**
   * Get brush configuration for zooming
   */
  static getBrushConfig(dataKey: string): any {
    return {
      dataKey,
      height: 30,
      stroke: defaultTheme.primary,
      fill: defaultTheme.background,
    };
  }

  /**
   * Get reference line configuration
   */
  static getReferenceLineConfig(
    value: number,
    label: string,
    color: string = defaultTheme.danger
  ): any {
    return {
      y: value,
      label: {
        value: label,
        position: 'right',
        fill: color,
      },
      stroke: color,
      strokeDasharray: '3 3',
    };
  }

  /**
   * Get reference area configuration
   */
  static getReferenceAreaConfig(
    y1: number,
    y2: number,
    label: string,
    color: string = defaultTheme.success
  ): any {
    return {
      y1,
      y2,
      label: {
        value: label,
        position: 'top',
      },
      fill: color,
      fillOpacity: 0.1,
    };
  }

  /**
   * Get custom dot configuration for line charts
   */
  static getCustomDot(color: string, size: number = 6): any {
    return {
      r: size,
      fill: color,
      stroke: '#fff',
      strokeWidth: 2,
    };
  }

  /**
   * Get error bar configuration
   */
  static getErrorBarConfig(dataKey: string, color: string = defaultTheme.danger): any {
    return {
      dataKey,
      width: 4,
      strokeWidth: 2,
      stroke: color,
    };
  }

  /**
   * Get composed chart configuration
   */
  static getComposedChartConfig(theme: ChartTheme = defaultTheme): any {
    return {
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      cartesianGrid: {
        strokeDasharray: '3 3',
        stroke: theme.grid,
      },
      xAxis: {
        stroke: theme.text,
        tick: { fill: theme.text },
      },
      yAxis: [
        {
          yAxisId: 'left',
          stroke: theme.text,
          tick: { fill: theme.text },
        },
        {
          yAxisId: 'right',
          orientation: 'right',
          stroke: theme.text,
          tick: { fill: theme.text },
        },
      ],
      tooltip: {
        contentStyle: {
          backgroundColor: theme.background,
          border: `1px solid ${theme.grid}`,
          borderRadius: '4px',
        },
      },
    };
  }

  /**
   * Get scatter chart configuration
   */
  static getScatterChartConfig(theme: ChartTheme = defaultTheme): any {
    return {
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      cartesianGrid: {
        strokeDasharray: '3 3',
        stroke: theme.grid,
      },
      xAxis: {
        type: 'number',
        stroke: theme.text,
        tick: { fill: theme.text },
      },
      yAxis: {
        type: 'number',
        stroke: theme.text,
        tick: { fill: theme.text },
      },
      scatter: {
        fill: theme.primary,
      },
      tooltip: {
        cursor: { strokeDasharray: '3 3' },
        contentStyle: {
          backgroundColor: theme.background,
          border: `1px solid ${theme.grid}`,
          borderRadius: '4px',
        },
      },
    };
  }

  /**
   * Get funnel chart configuration
   */
  static getFunnelChartConfig(theme: ChartTheme = defaultTheme): any {
    return {
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      funnel: {
        dataKey: 'value',
        nameKey: 'name',
        labelLine: true,
      },
      tooltip: {
        contentStyle: {
          backgroundColor: theme.background,
          border: `1px solid ${theme.grid}`,
          borderRadius: '4px',
        },
      },
    };
  }

  /**
   * Get treemap configuration
   */
  static getTreemapConfig(theme: ChartTheme = defaultTheme): any {
    return {
      dataKey: 'size',
      aspectRatio: 4 / 3,
      stroke: theme.background,
      fill: theme.primary,
      content: {
        fontSize: 12,
        fill: theme.text,
      },
    };
  }

  /**
   * Get sankey diagram configuration
   */
  static getSankeyConfig(theme: ChartTheme = defaultTheme): any {
    return {
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      node: {
        padding: 10,
        width: 20,
      },
      link: {
        opacity: 0.5,
      },
      tooltip: {
        contentStyle: {
          backgroundColor: theme.background,
          border: `1px solid ${theme.grid}`,
          borderRadius: '4px',
        },
      },
    };
  }

  /**
   * Export chart as image
   */
  static exportChartAsImage(chartRef: any, filename: string): void {
    if (!chartRef) return;

    const svg = chartRef.container.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  }
}

export default ChartConfigurations;
