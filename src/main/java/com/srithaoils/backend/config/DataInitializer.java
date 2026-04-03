package com.srithaoils.backend.config;

import com.srithaoils.backend.entity.Product;
import com.srithaoils.backend.repository.ProductRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Configuration
public class DataInitializer {

    @Bean
    ApplicationRunner seedProducts(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() > 0) {
                return;
            }

            List<Product> products = List.of(
                    new Product(
                            "Cold Pressed Coconut Oil",
                            "Traditional wood-pressed coconut oil with a clean aroma and smooth finish.",
                            randomPrice(),
                            "/images/products/coconut-oil.jpg",
                            50,
                            "1L"
                    ),
                    new Product(
                            "Groundnut Cooking Oil",
                            "Rich and flavorful groundnut oil ideal for deep frying and daily cooking.",
                            randomPrice(),
                            "/images/products/groundnut-oil.jpg",
                            45,
                            "1L"
                    ),
                    new Product(
                            "Sesame Gingelly Oil",
                            "Aromatic sesame oil suited for South Indian cooking and seasoning.",
                            randomPrice(),
                            "/images/products/sesame-oil.jpg",
                            40,
                            "1L"
                    ),
                    new Product(
                            "Sunflower Refined Oil",
                            "Light refined sunflower oil for everyday meals with a neutral taste.",
                            randomPrice(),
                            "/images/products/sunflower-oil.jpg",
                            60,
                            "1L"
                    ),
                    new Product(
                            "Mustard Oil",
                            "Bold mustard oil with a strong profile for marinades and regional dishes.",
                            randomPrice(),
                            "/images/products/mustard-oil.jpg",
                            35,
                            "1L"
                    )
            );

            productRepository.saveAll(products);
        };
    }

    private BigDecimal randomPrice() {
        int value = ThreadLocalRandom.current().nextInt(150, 601);
        return BigDecimal.valueOf(value).setScale(2);
    }
}
