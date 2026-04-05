package com.srithaoils.backend.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String url = properties.getUrl();

        if (url != null) {
            if (url.startsWith("postgresql://")) {
                properties.setUrl("jdbc:" + url);
            } else if (url.startsWith("postgres://")) {
                properties.setUrl("jdbc:postgresql://" + url.substring("postgres://".length()));
            }
        }

        return properties.initializeDataSourceBuilder().build();
    }
}
