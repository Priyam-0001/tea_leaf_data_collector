import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';

interface ImageThumbnailListProps {
  images: string[];
  onRemove?: (index: number) => void;
  onImagePress?: (index: number) => void;
}

export function ImageThumbnailList({ images, onRemove, onImagePress }: ImageThumbnailListProps) {
  if (images.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No images captured yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={images}
      horizontal
      keyExtractor={(item, index) => `${item}-${index}`}
      contentContainerStyle={styles.list}
      renderItem={({ item, index }) => (
        <View style={styles.thumbnailWrap}>
          <Pressable
            onPress={() => onImagePress?.(index)}
            style={({pressed}) => ({
              opacity: pressed ? 0.8 : 1,
            })}
            android_ripple={{color: '#ddd'}}
          >
            <Image
              source={{ uri: item }}
              style={styles.thumbnail} 
            />
          </Pressable>

          {onRemove ? (
            <Pressable
              accessibilityLabel={`Remove image ${index + 1}`}
              onPress={() => onRemove(index)}
              style={styles.removeButton}
            >
              <Text style={styles.removeText}>×</Text>
            </Pressable>
          ) : null}
        </View>
      )}
      showsHorizontalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  thumbnailWrap: {
    position: 'relative',
  },
  thumbnail: {
    width: 96,
    height: 96,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  empty: {
    paddingVertical: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
  },
});
