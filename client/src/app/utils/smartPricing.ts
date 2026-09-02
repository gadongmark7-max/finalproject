export const smartPricing = (data: {
    category: string;
    artistRate: number;
    size: number; 
    itemUsed: number;
    designComplexity: number; 
    bodyPart: string;
    isColored: boolean;
  }) => {
    const { category, size, designComplexity, itemUsed, artistRate, bodyPart, isColored } = data;
  
    let styleMultiplier = 1.0;
    switch (category) {
      case "Minimalist":   styleMultiplier = 1.0; break;
      case "Fine Line":    styleMultiplier = 1.1; break;
      case "Tribal":       styleMultiplier = 1.2; break;
      case "Blackwork":    styleMultiplier = 1.3; break;
      case "Illustrative": styleMultiplier = 1.4; break;
      case "Anime":        styleMultiplier = 1.5; break;
      case "Dotwork":      styleMultiplier = 1.6; break;
      case "Geometric":    styleMultiplier = 1.7; break;
      case "Japanese":     styleMultiplier = 1.8; break;
      case "Realism":      styleMultiplier = 1.9; break;
      case "Portrait":     styleMultiplier = 2.0; break;      
      default: styleMultiplier = 1.0;
    }
  
    let complexityMultiplier = 1.0;
    switch (designComplexity) {
      case 1: complexityMultiplier = 1.0; break;
      case 2: complexityMultiplier = 1.2; break;
      case 3: complexityMultiplier = 1.5; break;
      case 4: complexityMultiplier = 1.8; break;
      case 5: complexityMultiplier = 2.1; break;
      default: complexityMultiplier = 1.0;
    }

    let bodyPartMultiplier = 1.0;
    switch (bodyPart) {
      case "Arm":     bodyPartMultiplier = 1.2; break;
      case "Calves": bodyPartMultiplier = 1.3; break;
      case "Stomach":bodyPartMultiplier = 1.4; break;
      case "Legs":   bodyPartMultiplier = 1.5; break;
      case "Hand":   bodyPartMultiplier = 1.6; break;
      case "Chest":  bodyPartMultiplier = 1.7; break;
      case "Back":   bodyPartMultiplier = 1.8; break;
      case "Head":   bodyPartMultiplier = 2.0; break;
      default: bodyPartMultiplier = 1.0;
    }
  
    const colorMultiplier = isColored ? 1.5 : 1.0; 
  
    const basePricePerCm2 = 4; 
  
    const sizePrice = size * basePricePerCm2;
    const styledPrice = sizePrice * styleMultiplier;
    const complexityPrice = styledPrice * complexityMultiplier;
    const bodyPartPrice = complexityPrice * bodyPartMultiplier;
    const coloredPrice = bodyPartPrice * colorMultiplier;
    const materialsPrice = coloredPrice + itemUsed;
    const finalPrice = materialsPrice + artistRate;

    const lowerFactor = 0.9;
    const upperFactor = 1.3;

    const rawMin = finalPrice * lowerFactor;
    const rawMax = finalPrice * upperFactor;
  
    const estimatedPriceMin = Math.floor(rawMin / 10) * 10;
    const estimatedPriceMax = Math.ceil(rawMax / 10) * 10;
  
    return `₱${estimatedPriceMin.toLocaleString()} - ₱${estimatedPriceMax.toLocaleString()}`;
  };
  