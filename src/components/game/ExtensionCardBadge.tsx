import { Badge } from '@/components/ui/badge';
import { isExtensionCard, getCardExtensionInfo } from '@/data/extensionIntegration';

interface ExtensionCardBadgeProps {
  cardId: string;
  variant?: 'inline' | 'overlay';
}

export const ExtensionCardBadge = ({ cardId, variant = 'inline' }: ExtensionCardBadgeProps) => {
  if (!isExtensionCard(cardId)) {
    return null;
  }

  const extensionInfo = getCardExtensionInfo(cardId);
  
  if (variant === 'overlay') {
    return (
      <div className="absolute top-1 right-1 z-10">
        <Badge className="bg-purple-600/90 border-purple-400 text-white text-xs px-1 py-0.5 animate-fade-in">
          🦎
        </Badge>
      </div>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className="text-xs bg-purple-600/20 border-purple-400 text-purple-300 px-1.5 py-0.5"
      title={extensionInfo ? `From: ${extensionInfo.name} v${extensionInfo.version}` : 'Extension Card'}
    >
      🦎 EXT
    </Badge>
  );
};